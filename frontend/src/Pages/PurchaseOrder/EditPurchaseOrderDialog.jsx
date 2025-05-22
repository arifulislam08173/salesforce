import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";

const EditPurchaseOrderDialog = ({
  open,
  onClose,
  selectedPoId,
  purchaseOrders,
  organizations,
  products,
  poDetails,
  fetchPoDetails,
  setPurchaseOrders,
  setPoDetails,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selectedPo = purchaseOrders.find((po) => po.id === selectedPoId);

  // State for Purchase Order form
  const [poForm, setPoForm] = useState({
    po_no: "",
    po_date: "",
    po_type: "",
    pay_mode: "",
    discount: "",
    sub_total: "",
    grand_total: "",
    vds_total: "",
    tds_total: "",
    vendor_id: "",
    store_id: "",
    currency: "",
    subject: "",
    remarks: "",
    company_code: "",
    modified_by: "",
    po_id: "",
  });

  // State for Purchase Order Details
  const [detailsForm, setDetailsForm] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with existing data
  useEffect(() => {
    if (selectedPo) {
      setPoForm({
        po_no: selectedPo.po_no || "",
        po_date: selectedPo.po_date ? new Date(selectedPo.po_date).toISOString().split("T")[0] : "",
        po_type: selectedPo.po_type || "",
        pay_mode: selectedPo.pay_mode || "",
        discount: selectedPo.discount || "",
        sub_total: selectedPo.sub_total || "",
        grand_total: selectedPo.grand_total || "",
        vds_total: selectedPo.vds_total || "",
        tds_total: selectedPo.tds_total || "",
        vendor_id: selectedPo.vendor_id || "",
        store_id: selectedPo.store_id || "",
        currency: selectedPo.currency || "",
        subject: selectedPo.subject || "",
        remarks: selectedPo.remarks || "",
        company_code: selectedPo.company_code || "",
        modified_by: selectedPo.modified_by || "",
        po_id: selectedPo.po_id || "",
      });
    }
  }, [selectedPo, selectedPoId]);

  // Update details form when poDetails changes
  useEffect(() => {
    setDetailsForm(
      poDetails.map((detail) => ({
        id: detail.id,
        isNew: false, // Existing rows are not new
        isModified: false, // Track if row is modified
        line_no: detail.line_no || "",
        inv_product_id: detail.inv_product_id || "",
        quantity: detail.quantity || "",
        unit_price: detail.unit_price || "",
        discount: detail.discount || "",
        discount_pct: detail.discount_pct || "",
        total_price: detail.total_price || "",
        vds_pct: detail.vds_pct || "",
        vds: detail.vds || "",
        tds_pct: detail.tds_pct || "",
        tds: detail.tds || "",
      }))
    );
  }, [poDetails]);

  // Handle Purchase Order form changes
  const handlePoFormChange = (e) => {
    const { name, value } = e.target;
    setPoForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Purchase Order Detail form changes
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...detailsForm];
    updatedDetails[index][field] = value;
    updatedDetails[index].isModified = true; // Mark as modified

    // Recalculate total_price if quantity, unit_price, or discount changes
    if (field === "quantity" || field === "unit_price" || field === "discount") {
      const quantity = parseFloat(updatedDetails[index].quantity) || 0;
      const unit_price = parseFloat(updatedDetails[index].unit_price) || 0;
      const discount = parseFloat(updatedDetails[index].discount) || 0;
      updatedDetails[index].total_price = (quantity * unit_price - discount).toFixed(2);
    }

    setDetailsForm(updatedDetails);
  };

  // Add new detail row
  const addDetailRow = () => {
    setDetailsForm((prev) => [
      ...prev,
      {
        id: null,
        isNew: true, // Mark as new row
        isModified: true, // New rows are always modified
        line_no: (prev.length + 1).toString(),
        inv_product_id: "",
        quantity: "",
        unit_price: "",
        discount: "",
        discount_pct: "",
        total_price: "",
        vds_pct: "",
        vds: "",
        tds_pct: "",
        tds: "",
      },
    ]);
  };

  // Remove detail row
  const removeDetailRow = async (index) => {
    const detail = detailsForm[index];
    if (detail.id && !detail.isNew) {
      try {
        await axios.delete(`http://localhost:5000/api/purchaseorderdetail/${detail.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        // Refresh poDetails after deletion
        await fetchPoDetails(selectedPoId);
      } catch (err) {
        console.error("Error deleting Purchase Order Detail:", err);
        setError("Failed to delete order detail.");
        return;
      }
    }
    setDetailsForm((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const poIdToUse = selectedPo.po_id !== null ? selectedPo.po_id : selectedPo.id;
      console.log(`Saving PurchaseOrder id=${selectedPoId} with po_id=${poIdToUse}`);

      // Validate required fields
      if (!poForm.po_no || !poForm.sub_total || !poForm.grand_total || !poForm.vendor_id || !poForm.store_id) {
        setError("Please fill all required fields.");
        setLoading(false);
        return;
      }

      // Update Purchase Order
      const poResponse = await axios.put(
        `http://localhost:5000/api/purchaseorder/${selectedPoId}`,
        poForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Process Purchase Order Details (only new or modified rows)
      const updatedDetails = [];
      for (const detail of detailsForm) {
        // Skip unchanged existing rows
        if (!detail.isNew && !detail.isModified) {
          updatedDetails.push(detail); // Keep unchanged details in the state
          continue;
        }

        const detailData = {
          line_no: detail.line_no,
          inv_product_id: detail.inv_product_id,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          discount: detail.discount,
          discount_pct: detail.discount_pct,
          total_price: detail.total_price,
          vds_pct: detail.vds_pct,
          vds: detail.vds,
          tds_pct: detail.tds_pct,
          tds: detail.tds,
          po_id: poIdToUse,
        };

        try {
          if (detail.isNew) {
            // Create new detail
            const response = await axios.post(
              `http://localhost:5000/api/purchaseorderdetail`,
              detailData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            updatedDetails.push({ ...response.data.purchaseOrderDetail, isNew: false, isModified: false });
          } else if (detail.id && detail.isModified) {
            // Update existing detail
            const response = await axios.put(
              `http://localhost:5000/api/purchaseorderdetail/${detail.id}`,
              detailData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            updatedDetails.push({ ...response.data.purchaseOrderDetail, isNew: false, isModified: false });
          }
        } catch (err) {
          console.error(`Error processing detail id=${detail.id || 'new'}:`, err);
          throw new Error(`Failed to process Purchase Order Detail: ${err.message}`);
        }
      }

      // Update frontend state
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === selectedPoId ? poResponse.data.purchaseOrder : po))
      );

      // Update poDetails to reflect saved changes
      setPoDetails(updatedDetails);
      console.log('Updated poDetails:', updatedDetails);

      onClose();
    } catch (err) {
      console.error("Error updating purchase order:", err);
      setError(`Failed to update purchase order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate sub_total and grand_total
  useEffect(() => {
    const subTotal = detailsForm.reduce((sum, detail) => sum + (parseFloat(detail.total_price) || 0), 0);
    setPoForm((prev) => ({
      ...prev,
      sub_total: subTotal.toFixed(2),
      grand_total: (subTotal - (parseFloat(prev.discount) || 0)).toFixed(2),
    }));
  }, [detailsForm, poForm.discount]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          bgcolor: "#ffffff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          m: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          bgcolor: "#FAFAFA",
          color: "#111827",
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 4 },
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Edit Purchase Order - PO #{selectedPo?.po_no || "N/A"}
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#f9fafb" }}>
        {error && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {error}
          </Typography>
        )}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={isMobile ? 24 : 40} />
          </Box>
        ) : (
          <>
            {/* Purchase Order Form */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                mb: 2,
                color: "#111827",
              }}
            >
              Purchase Order Details
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 4,
              }}
            >
              <TextField
                label="PO Number"
                name="po_no"
                value={poForm.po_no}
                onChange={handlePoFormChange}
                size="small"
                required
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="PO Date"
                name="po_date"
                type="date"
                value={poForm.po_date}
                onChange={handlePoFormChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="PO Type"
                name="po_type"
                value={poForm.po_type}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Pay Mode"
                name="pay_mode"
                value={poForm.pay_mode}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Discount"
                name="discount"
                type="number"
                value={poForm.discount}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Subtotal"
                name="sub_total"
                type="number"
                value={poForm.sub_total}
                onChange={handlePoFormChange}
                size="small"
                required
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Grand Total"
                name="grand_total"
                type="number"
                value={poForm.grand_total}
                onChange={handlePoFormChange}
                size="small"
                required
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="VDS Total"
                name="vds_total"
                type="number"
                value={poForm.vds_total}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="TDS Total"
                name="tds_total"
                type="number"
                value={poForm.tds_total}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Vendor"
                name="vendor_id"
                select
                value={poForm.vendor_id}
                onChange={handlePoFormChange}
                size="small"
                required
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Store"
                name="store_id"
                select
                value={poForm.store_id}
                onChange={handlePoFormChange}
                size="small"
                required
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Currency"
                name="currency"
                value={poForm.currency}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Subject"
                name="subject"
                value={poForm.subject}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Remarks"
                name="remarks"
                value={poForm.remarks}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Company Code"
                name="company_code"
                value={poForm.company_code}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
              <TextField
                label="Parent PO ID"
                name="po_id"
                type="number"
                value={poForm.po_id}
                onChange={handlePoFormChange}
                size="small"
                sx={{ bgcolor: "#ffffff", borderRadius: "8px" }}
              />
            </Box>

            {/* Purchase Order Details Form */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Order Line Items
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addDetailRow}
                sx={{
                  textTransform: "none",
                  bgcolor: "#10B981",
                  "&:hover": { bgcolor: "#059669" },
                  fontFamily: "'Inter', sans-serif",
                  borderRadius: "8px",
                }}
              >
                Add Item
              </Button>
            </Box>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.05)",
                overflow: "hidden",
                bgcolor: "#ffffff",
              }}
            >
              <TableContainer sx={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        "Line",
                        "Product",
                        "Quantity",
                        "Unit Price",
                        "Discount",
                        "Discount %",
                        "Total Price",
                        "VDS %",
                        "VDS",
                        "TDS %",
                        "TDS",
                        "Actions",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: 600,
                            backgroundColor: "#FAFAFA",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            p: { xs: 1, sm: 1.5 },
                            minWidth: header === "Product" ? 200 : 100,
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailsForm.map((detail, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            value={detail.line_no}
                            onChange={(e) => handleDetailChange(index, "line_no", e.target.value)}
                            size="small"
                            sx={{ width: "80px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            select
                            value={detail.inv_product_id}
                            onChange={(e) => handleDetailChange(index, "inv_product_id", e.target.value)}
                            size="small"
                            sx={{ minWidth: "150px" }}
                          >
                            {products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.name} ({product.code})
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.quantity}
                            onChange={(e) => handleDetailChange(index, "quantity", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.unit_price}
                            onChange={(e) => handleDetailChange(index, "unit_price", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.discount}
                            onChange={(e) => handleDetailChange(index, "discount", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.discount_pct}
                            onChange={(e) => handleDetailChange(index, "discount_pct", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.total_price}
                            disabled
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.vds_pct}
                            onChange={(e) => handleDetailChange(index, "vds_pct", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.vds}
                            onChange={(e) => handleDetailChange(index, "vds", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.tds_pct}
                            onChange={(e) => handleDetailChange(index, "tds_pct", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <TextField
                            type="number"
                            value={detail.tds}
                            onChange={(e) => handleDetailChange(index, "tds", e.target.value)}
                            size="small"
                            sx={{ width: "100px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: { xs: 1, sm: 1.5 } }}>
                          <IconButton
                            onClick={() => removeDetailRow(index)}
                            sx={{
                              color: "#EF4444",
                              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 2, sm: 4 },
          bgcolor: "#FAFAFA",
          borderTop: "1px solid #e5e7eb",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            color: "#ffffff",
            bgcolor: "#6b7280",
            "&:hover": { bgcolor: "#4b5563" },
            px: { xs: 2, sm: 2 },
            py: 1,
            borderRadius: "8px",
            mr: 1,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontFamily: "'Inter', sans-serif",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            color: "#ffffff",
            bgcolor: "#10B981",
            "&:hover": { bgcolor: "#059669" },
            px: { xs: 2, sm: 3 },
            py: 1,
            borderRadius: "8px",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPurchaseOrderDialog;
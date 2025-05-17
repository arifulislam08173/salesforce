import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../../Components/Sidebar/Sidebar";

const CreatePurchaseOrder = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [formData, setFormData] = useState({
    po: {
      po_no: "",
      po_date: "",
      po_type: "",
      pay_mode: "",
      vendor_id: "",
      store_id: "",
      currency: "BDT",
      company_code: "",
      parent_po_id: "",
      subject: "",
      remarks: "",
      created_by: "",
      modified_by: "",
    },
    items: [
      {
        line_no: 1,
        inv_product_id: "",
        quantity: "1",
        unit_price: "0",
        discount: "0",
        discount_pct: "0",
        total_price: "0",
        vds_pct: "0",
        vds: "0",
        tds_pct: "0",
        tds: "0",
      },
    ],
  });
  const [organizations, setOrganizations] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
        setFormData((prev) => ({
          ...prev,
          po: {
            ...prev.po,
            created_by: decoded.id.toString(),
            modified_by: decoded.id.toString(),
          },
        }));
      } catch (err) {
        console.error("Error decoding JWT:", err);
        setError("Invalid authentication token");
      }
    }
  }, []);

  // Fetch organizations and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgResponse, productResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/organization", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }),
          axios.get("http://localhost:5000/api/invproduct", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }),
        ]);
        setOrganizations(orgResponse.data || []);
        setProducts(productResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch required data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate totals for each item and summary
  useEffect(() => {
    const updatedItems = formData.items.map((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unit_price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const discount_pct = parseFloat(item.discount_pct) || 0;
      const vds_pct = parseFloat(item.vds_pct) || 0;
      const tds_pct = parseFloat(item.tds_pct) || 0;

      const subtotal = quantity * unit_price;
      const total_price = subtotal - discount * (1 - discount_pct / 100);
      const vds = (total_price * vds_pct) / 100;
      const tds = (total_price * tds_pct) / 100;

      return {
        ...item,
        total_price: total_price.toFixed(2),
        vds: vds.toFixed(2),
        tds: tds.toFixed(2),
      };
    });

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  }, [formData.items]);

  // Summary calculations
  const summary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVds = 0;
    let totalTds = 0;

    formData.items.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unit_price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const vds = parseFloat(item.vds) || 0;
      const tds = parseFloat(item.tds) || 0;

      subtotal += quantity * unit_price;
      totalDiscount += discount;
      totalVds += vds;
      totalTds += tds;
    });

    const grandTotal = subtotal - totalDiscount - totalVds - totalTds;

    return {
      subtotal: subtotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      totalVds: totalVds.toFixed(2),
      totalTds: totalTds.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  }, [formData.items]);

  // Handle Purchase Order field changes
  const handlePoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      po: { ...prev.po, [name]: value },
    }));
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Add new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          line_no: prev.items.length + 1,
          inv_product_id: "",
          quantity: "1",
          unit_price: "0",
          discount: "0",
          discount_pct: "0",
          total_price: "0",
          vds_pct: "0",
          vds: "0",
          tds_pct: "0",
          tds: "0",
        },
      ],
    }));
  };

  // Delete item
  const deleteItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      line_no: i + 1,
    }));
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Validate form
  const isFormValid = () => {
    const { po, items } = formData;
    const poValid =
      po.po_no &&
      po.po_date &&
      po.vendor_id &&
      po.store_id &&
      summary.subtotal &&
      summary.grandTotal;
    const itemsValid = items.every(
      (item) => item.inv_product_id && item.quantity && item.unit_price && item.total_price
    );
    return poValid && items.length > 0 && itemsValid;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError(
        "Please fill all required fields: PO Number, PO Date, Vendor, Store, and at least one valid item with Product, Quantity, and Unit Price"
      );
      return;
    }

    setLoading(true);
    try {
      // Create Purchase Order
      const poPayload = {
        po_no: formData.po.po_no,
        po_date: formData.po.po_date || null,
        po_type: formData.po.po_type || null,
        pay_mode: formData.po.pay_mode || null,
        discount: parseFloat(summary.totalDiscount) || null,
        sub_total: parseFloat(summary.subtotal),
        grand_total: parseFloat(summary.grandTotal),
        vds_total: parseFloat(summary.totalVds) || null,
        tds_total: parseFloat(summary.totalTds) || null,
        vendor_id: parseInt(formData.po.vendor_id),
        store_id: parseInt(formData.po.store_id),
        currency: formData.po.currency || null,
        subject: formData.po.subject || null,
        remarks: formData.po.remarks || null,
        company_code: formData.po.company_code || null,
        created_by: formData.po.created_by || null,
        modified_by: formData.po.modified_by || null,
        po_id: formData.po.parent_po_id ? parseInt(formData.po.parent_po_id) : null,
      };

      const poResponse = await axios.post(
        "http://localhost:5000/api/purchaseorder",
        poPayload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
      );

      const po_id = poResponse.data.purchaseOrder.id;

      // Create Purchase Order Details
      const itemPromises = formData.items.map((item) =>
        axios.post(
          "http://localhost:5000/api/purchaseorderdetail",
          {
            line_no: item.line_no || null,
            inv_product_id: parseInt(item.inv_product_id),
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price),
            discount: parseFloat(item.discount) || null,
            discount_pct: parseFloat(item.discount_pct) || null,
            total_price: parseFloat(item.total_price),
            vds_pct: parseFloat(item.vds_pct) || null,
            vds: parseFloat(item.vds) || null,
            tds_pct: parseFloat(item.tds_pct) || null,
            tds: parseFloat(item.tds) || null,
            po_id,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
        )
      );

      await Promise.all(itemPromises);

      // Reset form
      setFormData({
        po: {
          po_no: "",
          po_date: "",
          po_type: "",
          pay_mode: "",
          vendor_id: "",
          store_id: "",
          currency: "BDT",
          company_code: "",
          parent_po_id: "",
          subject: "",
          remarks: "",
          created_by: userId ? userId.toString() : "",
          modified_by: userId ? userId.toString() : "",
        },
        items: [
          {
            line_no: 1,
            inv_product_id: "",
            quantity: "1",
            unit_price: "0",
            discount: "0",
            discount_pct: "0",
            total_price: "0",
            vds_pct: "0",
            vds: "0",
            tds_pct: "0",
            tds: "0",
          },
        ],
      });
      setError(null);
      alert("Purchase Order saved successfully!");
    } catch (err) {
      console.error("Error saving purchase order:", err);
      setError(`Failed to save purchase order: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          bgcolor: "#f3f4f6",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={isMobile ? 24 : 40} />
          </Box>
        ) : (
          <>
            {error && (
              <Typography
                sx={{
                  color: "#ef4444",
                  mb: 2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {error}
              </Typography>
            )}

            {/* Purchase Order Information */}
            <Paper
              sx={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                p: { xs: 2, sm: 3 },
                mb: 2,
                bgcolor: "white",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  fontWeight: 600,
                  mb: 2.5,
                  pb: 1.25,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Purchase Order Information
              </Typography>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "&::after": { content: '"*"', color: "#ef4444", ml: 0.25 },
                      }}
                    >
                      Purchase Order Number
                    </InputLabel>
                    <TextField
                      name="po_no"
                      value={formData.po.po_no}
                      onChange={handlePoChange}
                      size="small"
                      sx={{
                        "& .MuiInputBase-input": { fontSize: { xs: "0.875rem", sm: "0.875rem" } },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "&::after": { content: '"*"', color: "#ef4444", ml: 0.25 },
                      }}
                    >
                      PO Date
                    </InputLabel>
                    <TextField
                      name="po_date"
                      type="date"
                      value={formData.po.po_date}
                      onChange={handlePoChange}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiInputBase-input": { fontSize: { xs: "0.875rem", sm: "0.875rem" } },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                      PO Type
                    </InputLabel>
                    <Select
                      name="po_type"
                      value={formData.po.po_type}
                      onChange={handlePoChange}
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Select Type
                      </MenuItem>
                      <MenuItem value="Standard" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Standard
                      </MenuItem>
                      <MenuItem value="Bulk" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Bulk
                      </MenuItem>
                      <MenuItem value="IT" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        IT
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                      Payment Mode
                    </InputLabel>
                    <Select
                      name="pay_mode"
                      value={formData.po.pay_mode}
                      onChange={handlePoChange}
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Select Payment Mode
                      </MenuItem>
                      <MenuItem value="Cash" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Cash
                      </MenuItem>
                      <MenuItem value="Bank Transfer" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Bank Transfer
                      </MenuItem>
                      <MenuItem value="Credit Card" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Credit Card
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "&::after": { content: '"*"', color: "#ef4444", ml: 0.25 },
                      }}
                    >
                      Vendor
                    </InputLabel>
                    <Select
                      name="vendor_id"
                      value={formData.po.vendor_id}
                      onChange={handlePoChange}
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Select Vendor
                      </MenuItem>
                      {organizations.map((org) => (
                        <MenuItem
                          key={org.id}
                          value={org.id.toString()}
                          sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                        >
                          {org.name} ({org.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "&::after": { content: '"*"', color: "#ef4444", ml: 0.25 },
                      }}
                    >
                      Store
                    </InputLabel>
                    <Select
                      name="store_id"
                      value={formData.po.store_id}
                      onChange={handlePoChange}
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        Select Store
                      </MenuItem>
                      {organizations.map((org) => (
                        <MenuItem
                          key={org.id}
                          value={org.id.toString()}
                          sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
                        >
                          {org.name} ({org.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                      Currency
                    </InputLabel>
                    <Select
                      name="currency"
                      value={formData.po.currency}
                      onChange={handlePoChange}
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                      }}
                    >
                      <MenuItem value="BDT" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        BDT
                      </MenuItem>
                      <MenuItem value="USD" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        USD
                      </MenuItem>
                      <MenuItem value="EUR" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
                        EUR
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Company Code"
                    name="company_code"
                    value={formData.po.company_code}
                    onChange={handlePoChange}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiInputBase-input": { fontSize: { xs: "0.875rem", sm: "0.875rem" } },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Parent Purchase Order"
                    name="parent_po_id"
                    value={formData.po.parent_po_id}
                    onChange={handlePoChange}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiInputBase-input": { fontSize: { xs: "0.875rem", sm: "0.875rem" } },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Subject"
                    name="subject"
                    value={formData.po.subject}
                    onChange={handlePoChange}
                    fullWidth
                    size="small"
                    placeholder="e.g. Office Supplies Order"
                    sx={{
                      "& .MuiInputBase-input": { fontSize: { xs: "0.875rem", sm: "0.875rem" } },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Remarks"
                    name="remarks"
                    value={formData.po.remarks}
                    onChange={handlePoChange}
                    fullWidth
                    size="small"
                    placeholder="e.g. Urgent delivery required"
                    sx={{
                      "& .MuiInputBase-input": { fontSize: { xs: "0.875rem", sm: "0.875rem" } },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Purchase Order Items */}
            <Paper
              sx={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                p: { xs: 2, sm: 3 },
                mb: 2,
                bgcolor: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                  pb: 1.25,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Typography sx={{ fontSize: { xs: "1rem", sm: "1.125rem" }, fontWeight: 600 }}>
                  Purchase Order Items
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  sx={{
                    bgcolor: "#6366f1",
                    color: "white",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 500,
                    borderRadius: "4px",
                    textTransform: "none",
                    px: { xs: 2, sm: 3 },
                    py: 0.75,
                    "&:hover": { bgcolor: "#4f46e5" },
                  }}
                >
                  Add Item
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Line #
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Product
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Unit Price
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Discount
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Discount %
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Total Price
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        VDS %
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        VDS
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        TDS %
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        TDS
                      </TableCell>
                      <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 600, fontSize: "0.875rem", p: 1.5 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>{item.line_no}</TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <FormControl fullWidth size="small">
                            <Select
                              value={item.inv_product_id}
                              onChange={(e) => handleItemChange(index, "inv_product_id", e.target.value)}
                              sx={{
                                fontSize: "0.875rem",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                              }}
                            >
                              <MenuItem value="" sx={{ fontSize: "0.875rem" }}>
                                Select Product
                              </MenuItem>
                              {products.map((product) => (
                                <MenuItem
                                  key={product.id}
                                  value={product.id.toString()}
                                  sx={{ fontSize: "0.875rem" }}
                                >
                                  {product.name} ({product.code})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            size="small"
                            inputProps={{ min: 1 }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <TextField
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                            size="small"
                            inputProps={{ min: 0 }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <TextField
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                            size="small"
                            inputProps={{ min: 0 }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <TextField
                            type="number"
                            value={item.discount_pct}
                            onChange={(e) => handleItemChange(index, "discount_pct", e.target.value)}
                            size="small"
                            inputProps={{ min: 0, max: 100 }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5, bgcolor: "#f9fafb" }}>
                          <TextField
                            type="number"
                            value={item.total_price}
                            size="small"
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <TextField
                            type="number"
                            value={item.vds_pct}
                            onChange={(e) => handleItemChange(index, "vds_pct", e.target.value)}
                            size="small"
                            inputProps={{ min: 0 }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5, bgcolor: "#f9fafb" }}>
                          <TextField
                            type="number"
                            value={item.vds}
                            size="small"
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <TextField
                            type="number"
                            value={item.tds_pct}
                            onChange={(e) => handleItemChange(index, "tds_pct", e.target.value)}
                            size="small"
                            inputProps={{ min: 0 }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5, bgcolor: "#f9fafb" }}>
                          <TextField
                            type="number"
                            value={item.tds}
                            size="small"
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.875rem" },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", p: 1.5 }}>
                          <IconButton
                            onClick={() => deleteItem(index)}
                            sx={{ color: "#6b7280", "&:hover": { color: "#ef4444" } }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: "1rem" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Order Summary */}
            <Paper
              sx={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                p: { xs: 2, sm: 3 },
                bgcolor: "white",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  fontWeight: 600,
                  mb: 2.5,
                  pb: 1.25,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Order Summary
              </Typography>
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3.75 }}>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ bgcolor: "#f9fafb", p: 1.5, borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mb: 0.5 }}>
                      Subtotal
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {summary.subtotal}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ bgcolor: "#f9fafb", p: 1.5, borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mb: 0.5 }}>
                      Total Discount
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {summary.totalDiscount}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ bgcolor: "#f9fafb", p: 1.5, borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mb: 0.5 }}>
                      Total VDS
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {summary.totalVds}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ bgcolor: "#f9fafb", p: 1.5, borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mb: 0.5 }}>
                      Total TDS
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {summary.totalTds}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                  <Box sx={{ bgcolor: "#f9fafb", p: 1.5, borderRadius: "8px" }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "#6b7280", mb: 0.5 }}>
                      Grand Total
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                      {summary.grandTotal}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25 }}>
                <Button
                  onClick={() =>
                    setFormData({
                      po: {
                        po_no: "",
                        po_date: "",
                        po_type: "",
                        pay_mode: "",
                        vendor_id: "",
                        store_id: "",
                        currency: "BDT",
                        company_code: "",
                        parent_po_id: "",
                        subject: "",
                        remarks: "",
                        created_by: userId ? userId.toString() : "",
                        modified_by: userId ? userId.toString() : "",
                      },
                      items: [
                        {
                          line_no: 1,
                          inv_product_id: "",
                          quantity: "1",
                          unit_price: "0",
                          discount: "0",
                          discount_pct: "0",
                          total_price: "0",
                          vds_pct: "0",
                          vds: "0",
                          tds_pct: "0",
                          tds: "0",
                        },
                      ],
                    })
                  }
                  sx={{
                    bgcolor: "#f3f4f6",
                    color: "#374151",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 500,
                    borderRadius: "4px",
                    textTransform: "none",
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    "&:hover": { bgcolor: "#e5e7eb" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isFormValid() || loading}
                  sx={{
                    bgcolor: "#6366f1",
                    color: "white",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 500,
                    borderRadius: "4px",
                    textTransform: "none",
                    px: { xs: 2, sm: 3 },
                    py: 1,
                    "&:hover": { bgcolor: "#4f46e5" },
                    "&.Mui-disabled": { bgcolor: "#b0b0b0" },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Save Purchase Order"}
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>
      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </Sidebar>
  );
};

export default CreatePurchaseOrder;

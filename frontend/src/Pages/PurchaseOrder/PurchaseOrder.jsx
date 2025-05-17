import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Card,
  CardContent,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useTheme,               
  useMediaQuery, 
} from "@mui/material";
import {
  Search as SearchIcon,
  // FilterList as FilterListIcon,
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../../Components/Sidebar/Sidebar";

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`; // Use HSL for vibrant, distinct colors
};

const PurchaseOrders = () => {
  const theme = useTheme();                                      
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [formData, setFormData] = useState({
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
    created_by: "",
    modified_by: "",
    po_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Decode JWT to get user_id
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
        setFormData((prev) => ({
          ...prev,
          created_by: decoded.id.toString(),
          modified_by: decoded.id.toString(),
        }));
      } catch (err) {
        console.error("Error decoding JWT:", err);
        setError("Invalid authentication token");
      }
    }
  }, []);

  // Fetch all purchase orders and organizations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch purchase orders
        const poResponse = await axios.get("http://localhost:5000/api/purchaseorder", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setPurchaseOrders(poResponse.data);

        // Fetch organizations
        const orgResponse = await axios.get("http://localhost:5000/api/organization", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setOrganizations(orgResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch purchase orders or organizations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Define getPoTypeColor dynamically
  const getPoTypeColor = (poType) => {
    return poType ? stringToColor(poType) : "#6B7280";
  };

  // Compute purchaseOrders
  const poTypeData = purchaseOrders.reduce((acc, po) => {
    if (po.po_type) {
      const existing = acc.find((d) => d.name === po.po_type);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          name: po.po_type,
          count: 1,
          color: getPoTypeColor(po.po_type),
        });
      }
    }
    return acc;
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPurchaseOrders = purchaseOrders.filter(
    (po) =>
      (po.po_no &&
        po.po_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.po_type &&
        po.po_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.subject &&
        po.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.remarks &&
        po.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.company_code &&
        po.company_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentPurchaseOrders = filteredPurchaseOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAddPurchaseOrder = () => {
    setIsEdit(false);
    setFormData({
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
      created_by: userId ? userId.toString() : "",
      modified_by: userId ? userId.toString() : "",
      po_id: "",
    });
    setOpenModal(true);
  };

  const handleEdit = (purchaseOrder) => {
    setIsEdit(true);
    setCurrentPurchaseOrder(purchaseOrder);
    setFormData({
      po_no: purchaseOrder.po_no || "",
      po_date: purchaseOrder.po_date
        ? new Date(purchaseOrder.po_date).toISOString().split("T")[0]
        : "",
      po_type: purchaseOrder.po_type || "",
      pay_mode: purchaseOrder.pay_mode || "",
      discount: purchaseOrder.discount || "",
      sub_total: purchaseOrder.sub_total || "",
      grand_total: purchaseOrder.grand_total || "",
      vds_total: purchaseOrder.vds_total || "",
      tds_total: purchaseOrder.tds_total || "",
      vendor_id: purchaseOrder.vendor_id ? purchaseOrder.vendor_id.toString() : "",
      store_id: purchaseOrder.store_id ? purchaseOrder.store_id.toString() : "",
      currency: purchaseOrder.currency || "",
      subject: purchaseOrder.subject || "",
      remarks: purchaseOrder.remarks || "",
      company_code: purchaseOrder.company_code || "",
      created_by: purchaseOrder.created_by || userId?.toString() || "",
      modified_by: userId ? userId.toString() : "",
      po_id: purchaseOrder.po_id ? purchaseOrder.po_id.toString() : "",
    });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await axios.delete(`http://localhost:5000/api/purchaseorder/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
      } catch (err) {
        console.error("Error deleting purchase order:", err);
        setError("Failed to delete purchase order");
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    if (!formData.po_no || !formData.sub_total || !formData.grand_total || !formData.vendor_id || !formData.store_id) {
      setError("Purchase Order Number, Subtotal, Grand Total, Vendor, and Store are required");
      return;
    }

    try {
      const payload = {
        po_no: formData.po_no,
        po_date: formData.po_date || null,
        po_type: formData.po_type || null,
        pay_mode: formData.pay_mode || null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        sub_total: parseFloat(formData.sub_total),
        grand_total: parseFloat(formData.grand_total),
        vds_total: formData.vds_total ? parseFloat(formData.vds_total) : null,
        tds_total: formData.tds_total ? parseFloat(formData.tds_total) : null,
        vendor_id: parseInt(formData.vendor_id),
        store_id: parseInt(formData.store_id),
        currency: formData.currency || null,
        subject: formData.subject || null,
        remarks: formData.remarks || null,
        company_code: formData.company_code || null,
        created_by: formData.created_by || null,
        modified_by: formData.modified_by || null,
        po_id: formData.po_id ? parseInt(formData.po_id) : null,
      };

      if (isEdit && currentPurchaseOrder) {
        const response = await axios.put(
          `http://localhost:5000/api/purchaseorder/${currentPurchaseOrder.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setPurchaseOrders(
          purchaseOrders.map((po) =>
            po.id === currentPurchaseOrder.id ? response.data.purchaseOrder : po
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/purchaseorder",
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setPurchaseOrders([...purchaseOrders, response.data.purchaseOrder]);
      }
      setOpenModal(false);
      setError(null);
    } catch (err) {
      console.error("Error saving purchase order:", err);
      setError(`Failed to ${isEdit ? "update" : "create"} purchase order: ${err.response?.data?.error || err.message}`);
    }
  };

  // Helper to format dates for display
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  return (
    <Sidebar>
      <Box sx={{ width: "100%" }}>
        {/* Page Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,  
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#111827",
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "1.25rem", sm: "2rem" } 
            }}
          >
            Purchase Orders
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddPurchaseOrder}
            sx={{
              backgroundColor: "#6366F1",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(99, 102, 241, 0.2)",
              textTransform: "none",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                backgroundColor: "#4F46E5",
              },
            }}
          >
            Add Purchase Order
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Typography color="error" sx={{ mb: 2, fontFamily: "'Inter', sans-serif" }}>
            {error}
          </Typography>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={isMobile ? 24 : 40}/>
          </Box>
        ) : (
          <>
            {/* Po Type Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {poTypeData.map((type) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={type.name}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "16px",
                      height: "100%",
                      border: "1px solid rgba(0,0,0,0.05)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40,
                            backgroundColor: `${type.color}`,
                            color: "white",
                            fontWeight: 600,
                            mr: 1.5,
                          }}
                        >
                          {type.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {type.name}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {type.count} orders
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Search and Filter Tools */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextField
                placeholder="Search purchase orders..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: "320px" },
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
              {/* <Button
                startIcon={<FilterListIcon />}
                sx={{
                  display: { xs: "none", sm: "flex" },
                  color: "#6366F1",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                Filters
              </Button> */}
            </Box>

            {/* Purchase Order Table */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <TableContainer sx={{ maxHeight: {
                    xs: "60vh",           
                    sm: "70vh",           
                    md: "calc(100vh - 350px)",
                  }, }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>PO Number</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>PO Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>PO Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Pay Mode</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Discount</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Subtotal</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Grand Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>VDS Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>TDS Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Store</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Currency</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Remarks</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Company Code</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Created By</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Modified</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Modified By</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Parent PO ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: "#FAFAFA", fontFamily: "'Inter', sans-serif" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPurchaseOrders.map((po) => (
                      <TableRow key={po.id} hover>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.po_no}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{formatDate(po.po_date)}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.po_type || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.pay_mode || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.discount || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.sub_total}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.grand_total}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.vds_total || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.tds_total || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>
                          {organizations.find((org) => org.id === po.vendor_id)?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>
                          {organizations.find((org) => org.id === po.store_id)?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.currency || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.subject || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.remarks || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.company_code || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{formatDate(po.created)}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.created_by || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{formatDate(po.modified)}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>{po.modified_by || "N/A"}</TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif" }}>
                          {po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A"}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEdit(po)}
                            sx={{ color: "#6366F1" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(po.id)}
                            sx={{ color: "#EF4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredPurchaseOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontFamily: "'Inter', sans-serif",
                  },
                }}
              />
            </Paper>
          </>
        )}

        {/* Add/Edit Purchase Order Modal */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
            }}
          >
            {isEdit ? "Edit Purchase Order" : "Add Purchase Order"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Purchase Order Number"
                name="po_no"
                value={formData.po_no}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
                required
              />
              <TextField
                label="PO Date"
                name="po_date"
                type="date"
                value={formData.po_date}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="PO Type"
                name="po_type"
                value={formData.po_type}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Payment Mode"
                name="pay_mode"
                value={formData.pay_mode}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Discount"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Subtotal"
                name="sub_total"
                type="number"
                value={formData.sub_total}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
                required
              />
              <TextField
                label="Grand Total"
                name="grand_total"
                type="number"
                value={formData.grand_total}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
                required
              />
              <TextField
                label="VDS Total"
                name="vds_total"
                type="number"
                value={formData.vds_total}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="TDS Total"
                name="tds_total"
                type="number"
                value={formData.tds_total}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <FormControl fullWidth size="small">
                <InputLabel id="vendor-id-label">Vendor</InputLabel>
                <Select
                  labelId="vendor-id-label"
                  name="vendor_id"
                  value={formData.vendor_id}
                  onChange={handleFormChange}
                  label="Vendor"
                  required
                >
                  <MenuItem value="">Select Vendor</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id.toString()}>
                      {org.name} ({org.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="store-id-label">Store</InputLabel>
                <Select
                  labelId="store-id-label"
                  name="store_id"
                  value={formData.store_id}
                  onChange={handleFormChange}
                  label="Store"
                  required
                >
                  <MenuItem value="">Select Store</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id.toString()}>
                      {org.name} ({org.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Company Code"
                name="company_code"
                value={formData.company_code}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
              />
              <TextField
                label="Created By"
                name="created_by"
                value={formData.created_by}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
                disabled
              />
              <TextField
                label="Modified By"
                name="modified_by"
                value={formData.modified_by}
                onChange={handleFormChange}
                fullWidth
                size="small"
                variant="outlined"
                disabled
              />
              <FormControl fullWidth size="small">
                <InputLabel id="po-id-label">Parent Purchase Order</InputLabel>
                <Select
                  labelId="po-id-label"
                  name="po_id"
                  value={formData.po_id}
                  onChange={handleFormChange}
                  label="Parent Purchase Order"
                >
                  <MenuItem value="">None</MenuItem>
                  {purchaseOrders
                    .filter((po) => !isEdit || po.id !== currentPurchaseOrder?.id)
                    .map((po) => (
                      <MenuItem key={po.id} value={po.id.toString()}>
                        {po.po_no}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{
                textTransform: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              sx={{
                backgroundColor: "#6366F1",
                textTransform: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "&:hover": {
                  backgroundColor: "#4F46E5",
                },
              }}
            >
              {isEdit ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Sidebar>
  );
};

export default PurchaseOrders;
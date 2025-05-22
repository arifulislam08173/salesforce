// ************* All okay with Frontend search ***************** //

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   IconButton,
//   InputAdornment,
//   TextField,
//   Card,
//   CardContent,
//   Avatar,
//   Grid,
//   CircularProgress,
//   useTheme,
//   useMediaQuery,
//   Button,
//   Tooltip,
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Visibility as VisibilityIcon,
//   Print as PrintIcon,
//   CloudDownload as CloudDownloadIcon,
// } from "@mui/icons-material";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import Papa from "papaparse";
// import Sidebar from "../../Components/Sidebar/Sidebar";
// import PurchaseOrderDetailsDialog from "./PurchaseOrderDetailsDialog";
// import EditPurchaseOrderDialog from "./EditPurchaseOrderDialog";
// import { renderToString } from "react-dom/server";
// import PurchaseOrderPrint from "./PurchaseOrderPrint";

// const stringToColor = (string) => {
//   let hash = 0;
//   for (let i = 0; i < string.length; i++) {
//     hash = string.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   const hue = Math.abs(hash % 360);
//   return `hsl(${hue}, 70%, 50%)`;
// };

// const PurchaseOrders = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const [purchaseOrders, setPurchaseOrders] = useState([]);
//   const [organizations, setOrganizations] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState(false);
//   const [selectedPoId, setSelectedPoId] = useState(null);
//   const [poDetails, setPoDetails] = useState([]);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [detailsError, setDetailsError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState(null);

//   // Decode JWT to get user_id
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUserId(decoded.id);
//       } catch (err) {
//         console.error("Error decoding JWT:", err);
//         setError("Invalid authentication token");
//       }
//     }
//   }, []);

//   console.log(userId);

//   // Fetch purchase orders, organizations, and products
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [poResponse, orgResponse, productResponse] = await Promise.all([
//           axios.get("http://localhost:5000/api/purchaseorder", {
//             headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
//           }),
//           axios.get("http://localhost:5000/api/organization", {
//             headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
//           }),
//           axios.get("http://localhost:5000/api/invproduct", {
//             headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
//           }),
//         ]);
//         setPurchaseOrders(poResponse.data || []);
//         setOrganizations(orgResponse.data || []);
//         setProducts(productResponse.data || []);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to fetch required data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Fetch purchase order details using PurchaseOrder.po_id
//   const fetchPoDetails = async (purchaseOrderId) => {
//     setDetailsLoading(true);
//     setDetailsError(null);
//     setPoDetails([]); // Clear previous details
//     try {
//       const po = purchaseOrders.find((p) => p.id === purchaseOrderId);
//       if (!po) {
//         throw new Error(`Purchase Order with id ${purchaseOrderId} not found.`);
//       }
//       // Use po_id if not null, otherwise use id
//       const poIdToFetch = po.po_id !== null ? po.po_id : po.id;
//       console.log(
//         `Fetching details for PurchaseOrder.id=${purchaseOrderId}, po_no=${po.po_no || "N/A"}, using po_id=${poIdToFetch}`
//       );
//       const response = await axios.get(`http://localhost:5000/api/purchaseorderdetail?po_id=${poIdToFetch}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
//       });
//       console.log(`Fetched PO Details for po_id=${poIdToFetch}:`, response.data);
//       const filteredDetails = response.data.filter((detail) => detail.po_id === poIdToFetch);
//       setPoDetails(filteredDetails || []);
//       if (filteredDetails.length === 0) {
//         setDetailsError(
//           `No product details found for Purchase Order (PO No: ${po.po_no || "N/A"}) with po_id=${poIdToFetch}.`
//         );
//       }
//       return filteredDetails;
//     } catch (err) {
//       console.error(`Error fetching purchase order details for PurchaseOrder.id=${purchaseOrderId}:`, err);
//       setDetailsError("Failed to fetch purchase order details.");
//       return [];
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   // Define getPoTypeColor dynamically
//   const getPoTypeColor = (poType) => {
//     return poType ? stringToColor(poType) : "#6B7280";
//   };

//   // Compute poTypeData
//   const poTypeData = purchaseOrders.reduce((acc, po) => {
//     if (po.po_type) {
//       const existing = acc.find((d) => d.name === po.po_type);
//       if (existing) {
//         existing.count += 1;
//       } else {
//         acc.push({
//           name: po.po_type,
//           count: 1,
//           color: getPoTypeColor(po.po_type),
//         });
//       }
//     }
//     return acc;
//   }, []);

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const filteredPurchaseOrders = purchaseOrders.filter(
//     (po) =>
//       (po.po_no && po.po_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.po_type && po.po_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.pay_mode && po.pay_mode.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.subject && po.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.remarks && po.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.company_code && po.company_code.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const currentPurchaseOrders = filteredPurchaseOrders.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   const handleEdit = (poId) => {
//     setSelectedPoId(poId);
//     setEditOpen(true);
//     fetchPoDetails(poId); // Fetch details for editing
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this purchase order?")) {
//       try {
//         await axios.delete(`http://localhost:5000/api/purchaseorder/${id}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
//         });
//         setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
//       } catch (err) {
//         console.error("Error deleting purchase order:", err);
//         setError("Failed to delete purchase order");
//       }
//     }
//   };

//   const handleViewDetails = (poId) => {
//     setSelectedPoId(poId);
//     setViewDetailsOpen(true);
//     fetchPoDetails(poId);
//   };

//   const handlePrint = async (po) => {
//     await fetchPoDetails(po.id);
//     const printWindow = window.open("", "_blank");
//     const printContent = renderToString(
//       <PurchaseOrderPrint
//         po={po}
//         poDetails={poDetails}
//         organizations={organizations}
//         purchaseOrders={purchaseOrders}
//         products={products}
//       />
//     );
//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Purchase Order ${po.po_no}</title>
//           <script src="https://cdn.tailwindcss.com"></script>
//         </head>
//         <body>
//           ${printContent}
//           <script>
//             window.onload = () => {
//               window.print();
//               window.onafterprint = () => window.close();
//             };
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   const handleExport = async () => {
//     try {
//       // Prepare CSV data
//       const csvData = [];
//       const headers = [
//         "PO Number",
//         "PO Date",
//         "PO Type",
//         "Pay Mode",
//         "Discount",
//         "Subtotal",
//         "Grand Total",
//         "VDS Total",
//         "TDS Total",
//         "Vendor",
//         "Store",
//         "Currency",
//         "Subject",
//         "Remarks",
//         "Company Code",
//         "Created By",
//         "Modified By",
//         "Parent PO",
//         "Line #",
//         "Product Name",
//         "Product Code",
//         "Quantity",
//         "Unit Price",
//         "Discount (Detail)",
//         "Discount %",
//         "Total Price",
//         "VDS %",
//         "VDS",
//         "TDS %",
//         "TDS",
//       ];
//       csvData.push(headers);

//       // Helper to format dates
//       const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

//       // Fetch details for all filtered purchase orders
//       for (const po of filteredPurchaseOrders) {
//         const details = await fetchPoDetails(po.id);
//         const vendor = organizations.find((org) => org.id === po.vendor_id)?.name || "N/A";
//         const store = organizations.find((org) => org.id === po.store_id)?.name || "N/A";
//         const parentPo = po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A";

//         if (details.length === 0) {
//           // Add a row with PO data and empty detail fields
//           csvData.push([
//             po.po_no || "N/A",
//             formatDate(po.po_date),
//             po.po_type || "N/A",
//             po.pay_mode || "N/A",
//             po.discount || "N/A",
//             po.sub_total || "N/A",
//             po.grand_total || "N/A",
//             po.vds_total || "N/A",
//             po.tds_total || "N/A",
//             vendor,
//             store,
//             po.currency || "N/A",
//             po.subject || "N/A",
//             po.remarks || "N/A",
//             po.company_code || "N/A",
//             po.created_by || "N/A",
//             po.modified_by || "N/A",
//             parentPo,
//             "", // Line #
//             "", // Product Name
//             "", // Product Code
//             "", // Quantity
//             "", // Unit Price
//             "", // Discount (Detail)
//             "", // Discount %
//             "", // Total Price
//             "", // VDS %
//             "", // VDS
//             "", // TDS %
//             "", // TDS
//           ]);
//         } else {
//           // Add a row for each detail
//           details.forEach((detail) => {
//             const product = products.find((p) => p.id === detail.inv_product_id);
//             csvData.push([
//               po.po_no || "N/A",
//               formatDate(po.po_date),
//               po.po_type || "N/A",
//               po.pay_mode || "N/A",
//               po.discount || "N/A",
//               po.sub_total || "N/A",
//               po.grand_total || "N/A",
//               po.vds_total || "N/A",
//               po.tds_total || "N/A",
//               vendor,
//               store,
//               po.currency || "N/A",
//               po.subject || "N/A",
//               po.remarks || "N/A",
//               po.company_code || "N/A",
//               po.created_by || "N/A",
//               po.modified_by || "N/A",
//               parentPo,
//               detail.line_no || "N/A",
//               product?.name || "N/A",
//               product?.code || "N/A",
//               detail.quantity || "N/A",
//               detail.unit_price || "N/A",
//               detail.discount || "N/A",
//               detail.discount_pct || "N/A",
//               detail.total_price || "N/A",
//               detail.vds_pct || "N/A",
//               detail.vds || "N/A",
//               detail.tds_pct || "N/A",
//               detail.tds || "N/A",
//             ]);
//           });
//         }
//       }

//       // Generate CSV
//       const csv = Papa.unparse(csvData);

//       // Create and trigger download
//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       const now = new Date();
//       const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
//         now.getDate()
//       ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
//         now.getSeconds()
//       ).padStart(2, "0")}`;
//       const filename = `purchase_orders_${timestamp}.csv`;
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.setAttribute("download", filename);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       console.error("Error exporting data:", err);
//       setError("Failed to export purchase orders");
//     }
//   };

//   // Helper to format dates for display
//   const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

//   return (
//     <Sidebar>
//       <Box
//         sx={{
//           width: "100%",
//           maxWidth: "100%",
//           boxSizing: "border-box",
//           p: { xs: 1, sm: 2 },
//           pl: { xs: 1, sm: 1 }, // Reduced left padding to shift content left
//           bgcolor: "#f9fafb",
//           overflowX: "hidden", // Prevent horizontal scroll on main container
//         }}
//       >
//         {/* Page Header */}
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="h4"
//             sx={{
//               fontWeight: 700,
//               color: "#111827",
//               fontFamily: "'Poppins', sans-serif",
//               fontSize: { xs: "1.125rem", sm: "1.75rem" }, // Slightly smaller for mobile
//               textAlign: "left",
//             }}
//           >
//             Purchase Orders
//           </Typography>
//         </Box>

//         {/* Error Message */}
//         {error && (
//           <Typography
//             color="error"
//             sx={{ mb: 2, fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
//           >
//             {error}
//           </Typography>
//         )}

//         {/* Loading State */}
//         {loading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//             <CircularProgress size={isMobile ? 24 : 40} />
//           </Box>
//         ) : (
//           <>
//             {/* PO Type Summary Cards */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               {poTypeData.map((type) => (
//                 <Grid item xs={12} sm={6} md={4} lg={2.4} key={type.name}>
//                   <Card
//                     elevation={0}
//                     sx={{
//                       borderRadius: "12px",
//                       height: "100%",
//                       border: "1px solid rgba(0,0,0,0.05)",
//                       "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
//                     }}
//                   >
//                     <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
//                       <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                         <Avatar
//                           sx={{
//                             width: isMobile ? 28 : 36,
//                             height: isMobile ? 28 : 36,
//                             backgroundColor: type.color,
//                             color: "white",
//                             fontWeight: 600,
//                             mr: 1,
//                             fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                           }}
//                         >
//                           {type.name.charAt(0)}
//                         </Avatar>
//                         <Box>
//                           <Typography
//                             variant="h6"
//                             sx={{
//                               fontWeight: 600,
//                               fontSize: { xs: "0.8rem", sm: "0.9rem" },
//                               fontFamily: "'Inter', sans-serif",
//                             }}
//                           >
//                             {type.name}
//                           </Typography>
//                           <Typography
//                             color="text.secondary"
//                             variant="body2"
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.7rem", sm: "0.75rem" },
//                             }}
//                           >
//                             {type.count} orders
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>

//             {/* Search Tools and Export Button */}
//             <Box
//               sx={{
//                 mb: 2,
//                 display: "flex",
//                 flexDirection: { xs: "column", sm: "row" },
//                 gap: 1.5,
//                 justifyContent: "space-between",
//                 alignItems: { xs: "stretch", sm: "center" },
//               }}
//             >
//               <TextField
//                 placeholder="Search purchase orders..."
//                 variant="outlined"
//                 size="small"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 sx={{
//                   width: { xs: "100%", sm: "300px" },
//                   backgroundColor: "#ffffff",
//                   borderRadius: "8px",
//                   "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                   fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                 }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon sx={{ color: "text.secondary", fontSize: { xs: "1rem", sm: "1.25rem" } }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <Tooltip title="Export to CSV">
//                 <Button
//                   variant="contained"
//                   startIcon={<CloudDownloadIcon />}
//                   onClick={handleExport}
//                   sx={{
//                     bgcolor: "#3B82F6",
//                     color: "white",
//                     borderRadius: "8px",
//                     textTransform: "none",
//                     fontFamily: "'Inter', sans-serif",
//                     fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                     px: { xs: 1.5, sm: 2.5 },
//                     py: 0.75,
//                     "&:hover": {
//                       bgcolor: "#2563EB",
//                     },
//                   }}
//                 >
//                   Export
//                 </Button>
//               </Tooltip>
//             </Box>

//             {/* Purchase Order Table */}
//             <Paper
//               elevation={0}
//               sx={{
//                 borderRadius: "12px",
//                 overflow: "hidden",
//                 border: "1px solid rgba(0,0,0,0.05)",
//               }}
//             >
//               <TableContainer
//                 sx={{
//                   maxHeight: { xs: "60vh", sm: "70vh", md: "calc(100vh - 400px)" },
//                   maxWidth: "100%", // Ensure table fits container
//                   overflowX: "auto", // Enable horizontal scroll for table only
//                 }}
//               >
//                 <Table stickyHeader>
//                   <TableHead>
//                     <TableRow>
//                       {[
//                         "PO Number",
//                         "PO Date",
//                         "PO Type",
//                         "Pay Mode",
//                         "Discount",
//                         "Subtotal",
//                         "Grand Total",
//                         "VDS Total",
//                         "TDS Total",
//                         "Vendor",
//                         "Store",
//                         "Currency",
//                         "Subject",
//                         "Remarks",
//                         "Company Code",
//                         "Created By",
//                         "Modified By",
//                         "Parent PO ID",
//                         "Actions",
//                       ].map((header, index) => (
//                         <TableCell
//                           key={header}
//                           sx={{
//                             fontWeight: 600,
//                             backgroundColor: index === 18 ? "#F5F5F5" : "#FAFAFA",
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                             minWidth: index === 18 ? 180 : 80,
//                             ...(index === 18 && {
//                               position: "sticky",
//                               right: 0,
//                               zIndex: 2,
//                               borderLeft: "1px solid #e5e7eb",
//                               boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
//                             }),
//                           }}
//                         >
//                           {header}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {currentPurchaseOrders.map((po) => (
//                       <TableRow key={po.id} hover>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.po_no}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {formatDate(po.po_date)}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.po_type || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.pay_mode || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.discount || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.sub_total}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.grand_total}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.vds_total || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.tds_total || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {organizations.find((org) => org.id === po.vendor_id)?.name || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {organizations.find((org) => org.id === po.store_id)?.name || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.currency || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.subject || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.remarks || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.company_code || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.created_by || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.modified_by || "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                           }}
//                         >
//                           {po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A"}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                             p: { xs: 0.5, sm: 1 },
//                             whiteSpace: "nowrap",
//                             position: "sticky",
//                             right: 0,
//                             backgroundColor: "#fff",
//                             zIndex: 1,
//                             borderLeft: "1px solid #e5e7eb",
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               display: "flex",
//                               gap: { xs: 0.3, sm: 0.5 },
//                               alignItems: "center",
//                               bgcolor: "#f9fafb",
//                               p: { xs: 0.3, sm: 0.5 },
//                               borderRadius: 1,
//                               border: "1px solid #e5e7eb",
//                             }}
//                           >
//                             <IconButton
//                               onClick={() => handleViewDetails(po.id)}
//                               sx={{
//                                 color: "#10B981",
//                                 bgcolor: "rgba(16, 185, 129, 0.1)",
//                                 "&:hover": {
//                                   bgcolor: "rgba(16, 185, 129, 0.2)",
//                                 },
//                                 borderRadius: "50%",
//                                 p: { xs: 0.3, sm: 0.5 },
//                               }}
//                             >
//                               <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
//                             </IconButton>
//                             <IconButton
//                               onClick={() => handlePrint(po)}
//                               sx={{
//                                 color: "#3B82F6",
//                                 bgcolor: "rgba(59, 130, 246, 0.1)",
//                                 "&:hover": {
//                                   bgcolor: "rgba(59, 130, 246, 0.2)",
//                                 },
//                                 borderRadius: "50%",
//                                 p: { xs: 0.3, sm: 0.5 },
//                               }}
//                             >
//                               <PrintIcon fontSize={isMobile ? "small" : "medium"} />
//                             </IconButton>
//                             <IconButton
//                               onClick={() => handleEdit(po.id)}
//                               sx={{
//                                 color: "#6366F1",
//                                 bgcolor: "rgba(99, 102, 241, 0.1)",
//                                 "&:hover": {
//                                   bgcolor: "rgba(99, 102, 241, 0.2)",
//                                 },
//                                 borderRadius: "50%",
//                                 p: { xs: 0.3, sm: 0.5 },
//                               }}
//                             >
//                               <EditIcon fontSize={isMobile ? "small" : "medium"} />
//                             </IconButton>
//                             <IconButton
//                               onClick={() => handleDelete(po.id)}
//                               sx={{
//                                 color: "#EF4444",
//                                 bgcolor: "rgba(239, 68, 68, 0.1)",
//                                 "&:hover": {
//                                   bgcolor: "rgba(239, 68, 68, 0.2)",
//                                 },
//                                 borderRadius: "50%",
//                                 p: { xs: 0.3, sm: 0.5 },
//                               }}
//                             >
//                               <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
//                             </IconButton>
//                           </Box>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <TablePagination
//                 rowsPerPageOptions={[10, 25]}
//                 component="div"
//                 count={filteredPurchaseOrders.length}
//                 rowsPerPage={rowsPerPage}
//                 page={page}
//                 onPageChange={handleChangePage}
//                 onRowsPerPageChange={handleChangeRowsPerPage}
//                 sx={{
//                   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
//                     fontFamily: "'Inter', sans-serif",
//                     fontSize: { xs: "0.7rem", sm: "0.875rem" },
//                   },
//                 }}
//               />
//             </Paper>

//             {/* View Purchase Order Details Dialog */}
//             <PurchaseOrderDetailsDialog
//               open={viewDetailsOpen}
//               onClose={() => setViewDetailsOpen(false)}
//               selectedPoId={selectedPoId}
//               purchaseOrders={purchaseOrders}
//               products={products}
//               poDetails={poDetails}
//               detailsLoading={detailsLoading}
//               detailsError={detailsError}
//             />

//             {/* Edit Purchase Order Dialog */}
//             <EditPurchaseOrderDialog
//               open={editOpen}
//               onClose={() => setEditOpen(false)}
//               selectedPoId={selectedPoId}
//               purchaseOrders={purchaseOrders}
//               organizations={organizations}
//               products={products}
//               poDetails={poDetails}
//               fetchPoDetails={fetchPoDetails}
//               setPurchaseOrders={setPurchaseOrders}
//               setPoDetails={setPoDetails}
//             />
//           </>
//         )}
//       </Box>
//     </Sidebar>
//   );
// };

// export default PurchaseOrders;









import React, { useState, useEffect, useRef } from "react";
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
  IconButton,
  InputAdornment,
  TextField,
  Card,
  CardContent,
  Avatar,
  Grid,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Papa from "papaparse";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PurchaseOrderDetailsDialog from "./PurchaseOrderDetailsDialog";
import EditPurchaseOrderDialog from "./EditPurchaseOrderDialog";
import { renderToString } from "react-dom/server";
import PurchaseOrderPrint from "./PurchaseOrderPrint";

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PurchaseOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const searchInputRef = useRef(null); // Ref for search input

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [originalPurchaseOrders, setOriginalPurchaseOrders] = useState([]); // Store original data
  const [organizations, setOrganizations] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [poDetails, setPoDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Decode JWT to get user_id
  const authCheked = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (err) {
        console.error("Error decoding JWT:", err);
        setError("Invalid authentication token");
      }
    }
  };

  console.log(userId);

  // Fetch purchase orders, organizations, and products on mount
  useEffect(() => {
    authCheked();
    const fetchData = async () => {
      setLoading(true);
      try {
        const [poResponse, orgResponse, productResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/purchaseorder", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }),
          axios.get("http://localhost:5000/api/organization", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }),
          axios.get("http://localhost:5000/api/invproduct", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }),
        ]);
        setPurchaseOrders(poResponse.data || []);
        setOriginalPurchaseOrders(poResponse.data || []); // Store original data
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

  // Search purchase orders
  const searchPurchaseOrders = async (query) => {
    if (query.trim() === "") {
      setPurchaseOrders(originalPurchaseOrders); // Restore original data
      setPage(0);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/purchaseorder/search?query=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      setPurchaseOrders(response.data || []);
      setPage(0); // Reset to first page on new search
    } catch (err) {
      console.error("Error searching purchase orders:", err);
      setError("Failed to search purchase orders");
    } finally {
      setSearchLoading(false);
      // Restore focus to search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((query) => {
    searchPurchaseOrders(query);
  }, 500);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  // Fetch purchase order details using PurchaseOrder.po_id
  const fetchPoDetails = async (purchaseOrderId) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setPoDetails([]);
    try {
      const po = purchaseOrders.find((p) => p.id === purchaseOrderId);
      if (!po) {
        throw new Error(`Purchase Order with id ${purchaseOrderId} not found.`);
      }
      const poIdToFetch = po.po_id !== null ? po.po_id : po.id;
      console.log(
        `Fetching details for PurchaseOrder.id=${purchaseOrderId}, po_no=${po.po_no || "N/A"}, using po_id=${poIdToFetch}`
      );
      const response = await axios.get(
        `http://localhost:5000/api/purchaseorderdetail?po_id=${poIdToFetch}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      console.log(`Fetched PO Details for po_id=${poIdToFetch}:`, response.data);
      const filteredDetails = response.data.filter((detail) => detail.po_id === poIdToFetch);
      setPoDetails(filteredDetails || []);
      if (filteredDetails.length === 0) {
        setDetailsError(
          `No product details found for Purchase Order (PO No: ${po.po_no || "N/A"}) with po_id=${poIdToFetch}.`
        );
      }
      return filteredDetails;
    } catch (err) {
      console.error(`Error fetching purchase order details for PurchaseOrder.id=${purchaseOrderId}:`, err);
      setDetailsError("Failed to fetch purchase order details.");
      return [];
    } finally {
      setDetailsLoading(false);
    }
  };

  // Define getPoTypeColor dynamically
  const getPoTypeColor = (poType) => {
    return poType ? stringToColor(poType) : "#6B7280";
  };

  // Compute poTypeData
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

  const currentPurchaseOrders = purchaseOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleEdit = (poId) => {
    setSelectedPoId(poId);
    setEditOpen(true);
    fetchPoDetails(poId);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await axios.delete(`http://localhost:5000/api/purchaseorder/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
        setOriginalPurchaseOrders(originalPurchaseOrders.filter((po) => po.id !== id));
      } catch (err) {
        console.error("Error deleting purchase order:", err);
        setError("Failed to delete purchase order");
      }
    }
  };

  const handleViewDetails = (poId) => {
    setSelectedPoId(poId);
    setViewDetailsOpen(true);
    fetchPoDetails(poId);
  };

  const handlePrint = async (po) => {
    await fetchPoDetails(po.id);
    const printWindow = window.open("", "_blank");
    const printContent = renderToString(
      <PurchaseOrderPrint
        po={po}
        poDetails={poDetails}
        organizations={organizations}
        purchaseOrders={purchaseOrders}
        products={products}
      />
    );
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order ${po.po_no}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExport = async () => {
    try {
      const csvData = [];
      const headers = [
        "PO Number",
        "PO Date",
        "PO Type",
        "Pay Mode",
        "Discount",
        "Sub,total",
        "Grand Total",
        "VDS Total",
        "TDS Total",
        "Vendor",
        "Store",
        "Currency",
        "Subject",
        "Remarks",
        "Company Code",
        "Created By",
        "Modified By",
        "Parent PO",
        "Line",
        "Product Name",
        "Product Code",
        "Quantity",
        "Unit Price",
        "Discount (Detail)",
        "Discount %",
        "Total Price",
        "VDS %",
        "VDS",
        "TDS %",
        "TDS",
      ];
      csvData.push(headers);

      const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

      for (const po of purchaseOrders) {
        const details = await fetchPoDetails(po.id);
        const vendor = organizations.find((org) => org.id === po.vendor_id)?.name || "N/A";
        const store = organizations.find((org) => org.id === po.store_id)?.name || "N/A";
        const parentPo = po.po_id
          ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A"
          : "N/A";

        if (details.length === 0) {
          csvData.push([
            po.po_no || "N/A",
            formatDate(po.po_date),
            po.po_type || "N/A",
            po.pay_mode || "N/A",
            po.discount || "N/A",
            po.sub_total || "N/A",
            po.grand_total || "N/A",
            po.vds_total || "N/A",
            po.tds_total || "N/A",
            vendor,
            store,
            po.currency || "N/A",
            po.subject || "N/A",
            po.remarks || "N/A",
            po.company_code || "N/A",
            po.created_by || "N/A",
            po.modified_by || "N/A",
            parentPo,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]);
        } else {
          details.forEach((detail) => {
            const product = products.find((p) => p.id === detail.inv_product_id);
            csvData.push([
              po.po_no || "N/A",
              formatDate(po.po_date),
              po.po_type || "N/A",
              po.pay_mode || "N/A",
              po.discount || "N/A",
              po.sub_total || "N/A",
              po.grand_total || "N/A",
              po.vds_total || "N/A",
              po.tds_total || "N/A",
              vendor,
              store,
              po.currency || "N/A",
              po.subject || "N/A",
              po.remarks || "N/A",
              po.company_code || "N/A",
              po.created_by || "N/A",
              po.modified_by || "N/A",
              parentPo,
              detail.line_no || "N/A",
              product?.name || "N/A",
              product?.code || "N/A",
              detail.quantity || "N/A",
              detail.unit_price || "N/A",
              detail.discount || "N/A",
              detail.discount_pct || "N/A",
              detail.total_price || "N/A",
              detail.vds_pct || "N/A",
              detail.vds || "N/A",
              detail.tds_pct || "N/A",
              detail.tds || "N/A",
            ]);
          });
        }
      }

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
        now.getDate()
      ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(
        2,
        "0"
      )}${String(now.getSeconds()).padStart(2, "0")}`;
      const filename = `purchase_orders_${timestamp}.csv`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export purchase orders");
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  return (
    <Sidebar>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          p: { xs: 1, sm: 2 },
          pl: { xs: 1, sm: 1 },
          bgcolor: "#f9fafb",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#111827",
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "1.125rem", sm: "1.75rem" },
              textAlign: "left",
            }}
          >
            Purchase Orders
          </Typography>
        </Box>

        {error && (
          <Typography
            color="error"
            sx={{ mb: 2, fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
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
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {poTypeData.map((type) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={type.name}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "12px",
                      height: "100%",
                      border: "1px solid rgba(0,0,0,0.05)",
                      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Avatar
                          sx={{
                            width: isMobile ? 28 : 36,
                            height: isMobile ? 28 : 36,
                            backgroundColor: type.color,
                            color: "white",
                            fontWeight: 600,
                            mr: 1,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          {type.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
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

            <Box
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <TextField
                inputRef={searchInputRef} // Attach ref to TextField
                placeholder="Search purchase orders..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                  width: { xs: "100%", sm: "300px" },
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary", fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={16} />
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Tooltip title="Export to CSV">
                <Button
                  variant="contained"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleExport}
                  sx={{
                    bgcolor: "#3B82F6",
                    color: "white",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2.5 },
                    py: 0.75,
                    "&:hover": {
                      bgcolor: "#2563EB",
                    },
                  }}
                >
                  Export
                </Button>
              </Tooltip>
            </Box>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "opacity 0.3s ease", // Smooth transition for table
                opacity: searchLoading ? 0.7 : 1, // Fade during search
              }}
            >
              <TableContainer
                sx={{
                  maxHeight: { xs: "60vh", sm: "70vh", md: "calc(100vh - 400px)" },
                  maxWidth: "100%",
                  overflowX: "auto",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        "PO Number",
                        "PO Date",
                        "PO Type",
                        "Pay Mode",
                        "Discount",
                        "Subtotal",
                        "Grand Total",
                        "VDS Total",
                        "TDS Total",
                        "Vendor",
                        "Store",
                        "Currency",
                        "Subject",
                        "Remarks",
                        "Company Code",
                        "Created By",
                        "Modified By",
                        "Parent PO ID",
                        "Actions",
                      ].map((header, index) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: 600,
                            backgroundColor: index === 18 ? "#F5F5F5" : "#FAFAFA",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                            minWidth: index === 18 ? 180 : 80,
                            ...(index === 18 && {
                              position: "sticky",
                              right: 0,
                              zIndex: 2,
                              borderLeft: "1px solid #e5e7eb",
                              boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
                            }),
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPurchaseOrders.map((po) => (
                      <TableRow key={po.id} hover>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.po_no}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(po.po_date)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.po_type || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.pay_mode || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.discount || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.sub_total}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.grand_total}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.vds_total || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.tds_total || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {organizations.find((org) => org.id === po.vendor_id)?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {organizations.find((org) => org.id === po.store_id)?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.currency || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.subject || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.remarks || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.company_code || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.created_by || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.modified_by || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                          }}
                        >
                          {po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            p: { xs: 0.5, sm: 1 },
                            whiteSpace: "nowrap",
                            position: "sticky",
                            right: 0,
                            backgroundColor: "#fff",
                            zIndex: 1,
                            borderLeft: "1px solid #e5e7eb",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: { xs: 0.3, sm: 0.5 },
                              alignItems: "center",
                              bgcolor: "#f9fafb",
                              p: { xs: 0.3, sm: 0.5 },
                              borderRadius: 1,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <IconButton
                              onClick={() => handleViewDetails(po.id)}
                              sx={{
                                color: "#10B981",
                                bgcolor: "rgba(16, 185, 129, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(16, 185, 129, 0.2)",
                                },
                                borderRadius: "50%",
                                p: { xs: 0.3, sm: 0.5 },
                              }}
                            >
                              <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                            <IconButton
                              onClick={() => handlePrint(po)}
                              sx={{
                                color: "#3B82F6",
                                bgcolor: "rgba(59, 130, 246, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(59, 130, 246, 0.2)",
                                },
                                borderRadius: "50%",
                                p: { xs: 0.3, sm: 0.5 },
                              }}
                            >
                              <PrintIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleEdit(po.id)}
                              sx={{
                                color: "#6366F1",
                                bgcolor: "rgba(99, 102, 241, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(99, 102, 241, 0.2)",
                                },
                                borderRadius: "50%",
                                p: { xs: 0.3, sm: 0.5 },
                              }}
                            >
                              <EditIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(po.id)}
                              sx={{
                                color: "#EF4444",
                                bgcolor: "rgba(239, 68, 68, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(239, 68, 68, 0.2)",
                                },
                                borderRadius: "50%",
                                p: { xs: 0.3, sm: 0.5 },
                              }}
                            >
                              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25]}
                component="div"
                count={purchaseOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  },
                }}
              />
            </Paper>

            <PurchaseOrderDetailsDialog
              open={viewDetailsOpen}
              onClose={() => setViewDetailsOpen(false)}
              selectedPoId={selectedPoId}
              purchaseOrders={purchaseOrders}
              products={products}
              poDetails={poDetails}
              detailsLoading={detailsLoading}
              detailsError={detailsError}
            />

            <EditPurchaseOrderDialog
              open={editOpen}
              onClose={() => setEditOpen(false)}
              selectedPoId={selectedPoId}
              purchaseOrders={purchaseOrders}
              organizations={organizations}
              products={products}
              poDetails={poDetails}
              fetchPoDetails={fetchPoDetails}
              setPurchaseOrders={setPurchaseOrders}
              setPoDetails={setPoDetails}
            />
          </>
        )}
      </Box>
    </Sidebar>
  );
};

export default PurchaseOrders;
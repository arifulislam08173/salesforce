// import React, { useState, useEffect, useRef } from "react";
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
//   Button,
//   IconButton,
//   InputAdornment,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   useTheme,
//   useMediaQuery,
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   Visibility as VisibilityIcon,
//   Print as PrintIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
// } from "@mui/icons-material";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import Sidebar from "../../Components/Sidebar/Sidebar";

// const API_URL = "http://localhost:5000/api";

// const PurchaseOrders = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const [purchaseOrders, setPurchaseOrders] = useState([]);
//   const [organizations, setOrganizations] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [poDetails, setPoDetails] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
//   const [selectedPo, setSelectedPo] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [detailsError, setDetailsError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       try { jwtDecode(token); } catch { setError("Invalid auth token"); }
//     }
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const [poRes, orgRes, prodRes] = await Promise.all([
//           axios.get(`${API_URL}/purchaseorder`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }}),
//           axios.get(`${API_URL}/organization`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }}),
//           axios.get(`${API_URL}/invproduct`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }}),
//         ]);
//         setPurchaseOrders(poRes.data);
//         setOrganizations(orgRes.data);
//         setProducts(prodRes.data);
//       } catch (err) {
//         console.error(err);
//         setError(err.response?.data?.error || err.message || "Failed fetching data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const fetchPoDetails = async (poId) => {
//     setDetailsLoading(true);
//     setDetailsError(null);
//     try {
//       const res = await axios.get(`${API_URL}/purchaseorderdetail`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }});
//       const matched = res.data.filter((d) => d.po_id === poId);
//       setPoDetails(matched);
//       if (!matched.length) {
//         setDetailsError(`No details for PO id ${poId}.`);
//       }
//     } catch (err) {
//       console.error(err);
//       setDetailsError(err.response?.data?.error || err.message || "Failed to load details");
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   const handleViewDetails = (po) => {
//     setSelectedPo(po);
//     // Determine which ID to fetch: if this PO has a parent, use its parent ID
//     const lookupId = po.po_id ?? po.id;
//     fetchPoDetails(lookupId);
//     setViewDetailsOpen(true);
//   };

//   const handlePrint = () => window.print();
//   const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

//   const filtered = purchaseOrders.filter((po) =>
//     [po.po_no, po.po_type, po.subject, po.remarks, po.company_code]
//       .some((f) => f?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
//   );
//   const pageData = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   return (
//     <Sidebar>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h4" sx={{ mb:2 }}>Purchase Orders</Typography>
//         {error && <Typography color="error" sx={{ mb:2 }}>{error}</Typography>}
//         {loading ? (
//           <Box sx={{ textAlign:'center', my:4 }}><CircularProgress size={isMobile?24:40}/></Box>
//         ) : (
//           <>
//             <TextField
//               placeholder="Search..."
//               size="small"
//               value={searchTerm}
//               onChange={(e)=>setSearchTerm(e.target.value)}
//               InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment> }}
//               sx={{ mb:2, width: isMobile?'100%':'300px' }}
//             />
//             <Paper sx={{ borderRadius:2, overflow:'hidden' }}>
//               <TableContainer sx={{ maxHeight: isMobile?'50vh':'65vh' }}>
//                 <Table stickyHeader size="small">
//                   <TableHead>
//                     <TableRow>
//                       {['PO #','Date','Type','PayMode','Subtotal','GrandTotal','Vendor','Actions'].map(h=>(
//                         <TableCell key={h} sx={{ fontWeight:600 }}>{h}</TableCell>
//                       ))}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {pageData.map(po=>(
//                       <TableRow key={po.id} hover>
//                         <TableCell>{po.po_no}</TableCell>
//                         <TableCell>{formatDate(po.po_date)}</TableCell>
//                         <TableCell>{po.po_type||'N/A'}</TableCell>
//                         <TableCell>{po.pay_mode||'N/A'}</TableCell>
//                         <TableCell>{po.sub_total}</TableCell>
//                         <TableCell>{po.grand_total}</TableCell>
//                         <TableCell>{organizations.find(o=>o.id===po.vendor_id)?.name||'N/A'}</TableCell>
//                         <TableCell>
//                           <IconButton onClick={()=>handleViewDetails(po)}><VisibilityIcon/></IconButton>
//                           <IconButton onClick={handlePrint}><PrintIcon/></IconButton>
//                           <IconButton><EditIcon/></IconButton>
//                           <IconButton><DeleteIcon/></IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <TablePagination
//                 rowsPerPageOptions={[5,10,25]}
//                 component="div"
//                 count={filtered.length}
//                 rowsPerPage={rowsPerPage}
//                 page={page}
//                 onPageChange={(e,p)=>setPage(p)}
//                 onRowsPerPageChange={(e)=>{setRowsPerPage(+e.target.value);setPage(0)}}
//               />
//             </Paper>
//           </>
//         )}

//         <Dialog open={viewDetailsOpen} onClose={()=>setViewDetailsOpen(false)} maxWidth="md" fullWidth>
//           <DialogTitle>Details for PO {selectedPo?.po_no}</DialogTitle>
//           <DialogContent dividers>
//             {detailsError && <Typography color="error" sx={{ mb:2 }}>{detailsError}</Typography>}
//             {detailsLoading ? (
//               <Box sx={{ textAlign:'center', my:4 }}><CircularProgress size={isMobile?24:40}/></Box>
//             ) : (
//               <TableContainer>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       {['Line','Product','Qty','UnitPrice','Total'].map(h=>(
//                         <TableCell key={h} sx={{ fontWeight:600 }}>{h}</TableCell>
//                       ))}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {poDetails.length ? poDetails.map(d=>(
//                       <TableRow key={d.id} hover>
//                         <TableCell>{d.line_no||'N/A'}</TableCell>
//                         <TableCell>{products.find(p=>p.id===d.inv_product_id)?.name||'N/A'}</TableCell>
//                         <TableCell>{d.quantity}</TableCell>
//                         <TableCell>{d.unit_price}</TableCell>
//                         <TableCell>{d.total_price}</TableCell>
//                       </TableRow>
//                     )) : (
//                       <TableRow><TableCell colSpan={5} align="center">No details found.</TableCell></TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </DialogContent>
//           <DialogActions><Button onClick={()=>setViewDetailsOpen(false)}>Close</Button></DialogActions>
//         </Dialog>
//       </Box>
//     </Sidebar>
//   );
// };

// export default PurchaseOrders;






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
//   Button,
//   IconButton,
//   InputAdornment,
//   TextField,
//   Card,
//   CardContent,
//   Avatar,
//   Grid,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   useTheme,
//   useMediaQuery,
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Visibility as VisibilityIcon,
//   Print as PrintIcon,
// } from "@mui/icons-material";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import Sidebar from "../../Components/Sidebar/Sidebar";

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
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
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
//       // Use po_id if it exists (indicating a parent PO), otherwise use the PurchaseOrder.id
//       const poIdToFetch = po.po_id !== null ? po.po_id : po.id;
//       console.log(
//         `Fetching details for PurchaseOrder.id=${purchaseOrderId}, po_no=${po.po_no || "N/A"}, using po_id=${poIdToFetch}`
//       );
//       const response = await axios.get(`http://localhost:5000/api/purchaseorderdetail?po_id=${poIdToFetch}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
//       });
//       console.log(`Fetched PO Details for po_id=${poIdToFetch}:`, response.data, {
//         status: response.status,
//         headers: response.headers,
//       });
//       // Filter to ensure PurchaseOrderDetail.po_id matches the po_id we queried
//       const filteredDetails = response.data.filter((detail) => detail.po_id === poIdToFetch);
//       console.log(`Filtered PO Details (po_id=${poIdToFetch}):`, filteredDetails);
//       setPoDetails(filteredDetails || []);
//       if (filteredDetails.length === 0) {
//         setDetailsError(
//           `No product details found for Purchase Order (PO No: ${po.po_no || "N/A"}) with po_id=${poIdToFetch}. Please verify that purchase_order_detail.po_id matches ${poIdToFetch} in the database. Run: SELECT * FROM purchase_order_detail WHERE po_id = ${poIdToFetch};`
//         );
//         console.warn(
//           `No PurchaseOrderDetail records found for po_id=${poIdToFetch}. Verify the database with: SELECT * FROM purchase_order_detail WHERE po_id = ${poIdToFetch};`
//         );
//       }
//     } catch (err) {
//       console.error(`Error fetching purchase order details for PurchaseOrder.id=${purchaseOrderId}:`, err);
//       setDetailsError("Failed to fetch purchase order details. Please try again or contact support.");
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
//       (po.subject && po.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.remarks && po.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (po.company_code && po.company_code.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const currentPurchaseOrders = filteredPurchaseOrders.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   const handleEdit = (purchaseOrder) => {
//     console.log("Edit PO:", purchaseOrder); // Placeholder
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
//     setPoDetails([]); // Clear previous details
//     setSelectedPoId(poId);
//     fetchPoDetails(poId);
//     setViewDetailsOpen(true);
//   };

//   const handlePrint = async (po) => {
//     // Fetch fresh details using po_id
//     const poIdToFetch = po.po_id !== null ? po.po_id : po.id;
//     await fetchPoDetails(po.id); // Fetch details using the updated logic
//     const vendor = organizations.find((org) => org.id === po.vendor_id)?.name || "N/A";
//     const store = organizations.find((org) => org.id === po.store_id)?.name || "N/A";
//     const parentPo = po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A";

//     const printContent = `
//       <html>
//         <head>
//           <title>Purchase Order ${po.po_no}</title>
//           <style>
//             body { font-family: 'Inter', sans-serif; margin: 20px; }
//             h1 { font-size: 24px; color: #1f2937; }
//             h2 { font-size: 18px; color: #1f2937; margin-top: 20px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//             th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
//             th { background-color: #f9fafb; font-weight: 600; }
//             .info-grid { display: grid; grid-template-columns: auto auto; gap: 10px; margin-bottom: 20px; }
//             .label { font-weight: 600; color: #6b7280; }
//             .no-details { color: #6b7280; font-style: italic; }
//           </style>
//         </head>
//         <body>
//           <h1>Purchase Order: ${po.po_no}</h1>
//           <div class="info-grid">
//             <span class="label">PO Date:</span><span>${formatDate(po.po_date)}</span>
//             <span class="label">PO Type:</span><span>${po.po_type || "N/A"}</span>
//             <span class="label">Pay Mode:</span><span>${po.pay_mode || "N/A"}</span>
//             <span class="label">Vendor:</span><span>${vendor}</span>
//             <span class="label">Store:</span><span>${store}</span>
//             <span class="label">Currency:</span><span>${po.currency || "N/A"}</span>
//             <span class="label">Subtotal:</span><span>${po.sub_total}</span>
//             <span class="label">Grand Total:</span><span>${po.grand_total}</span>
//             <span class="label">Discount:</span><span>${po.discount || "N/A"}</span>
//             <span class="label">VDS Total:</span><span>${po.vds_total || "N/A"}</span>
//             <span class="label">TDS Total:</span><span>${po.tds_total || "N/A"}</span>
//             <span class="label">Subject:</span><span>${po.subject || "N/A"}</span>
//             <span class="label">Remarks:</span><span>${po.remarks || "N/A"}</span>
//             <span class="label">Company Code:</span><span>${po.company_code || "N/A"}</span>
//             <span class="label">Parent PO:</span><span>${parentPo}</span>
//             <span class="label">Created:</span><span>${formatDate(po.created)}</span>
//             <span class="label">Created By:</span><span>${po.created_by || "N/A"}</span>
//             <span class="label">Modified:</span><span>${formatDate(po.modified)}</span>
//             <span class="label">Modified By:</span><span>${po.modified_by || "N/A"}</span>
//           </div>
//           <h2>Order Details</h2>
//           ${
//             poDetails.length === 0
//               ? `<p class="no-details">No product details found for this purchase order (po_id: ${poIdToFetch}).</p>`
//               : `
//           <table>
//             <tr>
//               <th>Line #</th>
//               <th>Product</th>
//               <th>Quantity</th>
//               <th>Unit Price</th>
//               <th>Discount</th>
//               <th>Discount %</th>
//               <th>Total Price</th>
//               <th>VDS %</th>
//               <th>VDS</th>
//               <th>TDS %</th>
//               <th>TDS</th>
//             </tr>
//             ${poDetails
//               .map(
//                 (detail) => `
//                   <tr>
//                     <td>${detail.line_no || "N/A"}</td>
//                     <td>${products.find((p) => p.id === detail.inv_product_id)?.name || "N/A"} (${
//                       products.find((p) => p.id === detail.inv_product_id)?.code || "N/A"
//                     })</td>
//                     <td>${detail.quantity || "N/A"}</td>
//                     <td>${detail.unit_price || "N/A"}</td>
//                     <td>${detail.discount || "N/A"}</td>
//                     <td>${detail.discount_pct || "N/A"}</td>
//                     <td>${detail.total_price || "N/A"}</td>
//                     <td>${detail.vds_pct || "N/A"}</td>
//                     <td>${detail.vds || "N/A"}</td>
//                     <td>${detail.tds_pct || "N/A"}</td>
//                     <td>${detail.tds || "N/A"}</td>
//                   </tr>
//                 `
//               )
//               .join("")}
//           </table>
//           `
//           }
//         </body>
//       </html>
//     `;
//     const printWindow = window.open("", "_blank");
//     printWindow.document.write(printContent);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   // Helper to format dates for display
//   const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

//   return (
//     <Sidebar>
//       <Box sx={{ width: "100%", p: { xs: 2, sm: 4 }, bgcolor: "#f9fafb" }}>
//         {/* Page Header */}
//         <Box sx={{ mb: 4 }}>
//           <Typography
//             variant="h4"
//             sx={{
//               fontWeight: 700,
//               color: "#111827",
//               fontFamily: "'Poppins', sans-serif",
//               fontSize: { xs: "1.25rem", sm: "2rem" },
//             }}
//           >
//             Purchase Orders
//           </Typography>
//         </Box>

//         {/* Error Message */}
//         {error && (
//           <Typography
//             color="error"
//             sx={{ mb: 2, fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.875rem", sm: "1rem" } }}
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
//             <Grid container spacing={3} sx={{ mb: 4 }}>
//               {poTypeData.map((type) => (
//                 <Grid item xs={12} sm={6} md={4} lg={2.4} key={type.name}>
//                   <Card
//                     elevation={0}
//                     sx={{
//                       borderRadius: "16px",
//                       height: "100%",
//                       border: "1px solid rgba(0,0,0,0.05)",
//                       "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
//                     }}
//                   >
//                     <CardContent>
//                       <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                         <Avatar
//                           sx={{
//                             width: isMobile ? 32 : 40,
//                             height: isMobile ? 32 : 40,
//                             backgroundColor: type.color,
//                             color: "white",
//                             fontWeight: 600,
//                             mr: 1.5,
//                           }}
//                         >
//                           {type.name.charAt(0)}
//                         </Avatar>
//                         <Box>
//                           <Typography
//                             variant="h6"
//                             sx={{
//                               fontWeight: 600,
//                               fontSize: { xs: "0.9rem", sm: "1rem" },
//                               fontFamily: "'Inter', sans-serif",
//                             }}
//                           >
//                             {type.name}
//                           </Typography>
//                           <Typography
//                             color="text.secondary"
//                             variant="body2"
//                             sx={{ fontFamily: "'Inter', sans-serif" }}
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

//             {/* Search Tools */}
//             <Box
//               sx={{
//                 mb: 3,
//                 display: "flex",
//                 flexDirection: { xs: "column", sm: "row" },
//                 gap: 2,
//                 justifyContent: "flex-start",
//                 alignItems: "center",
//               }}
//             >
//               <TextField
//                 placeholder="Search purchase orders..."
//                 variant="outlined"
//                 size="small"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 sx={{
//                   width: { xs: "100%", sm: "320px" },
//                   backgroundColor: "#ffffff",
//                   borderRadius: "8px",
//                   "& .MuiOutlinedInput-root": { borderRadius: "8px" },
//                   fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                 }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon sx={{ color: "text.secondary" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//             </Box>

//             {/* Purchase Order Table */}
//             <Paper
//               elevation={0}
//               sx={{
//                 borderRadius: "16px",
//                 overflow: "hidden",
//                 border: "1px solid rgba(0,0,0,0.05)",
//               }}
//             >
//               <TableContainer
//                 sx={{
//                   maxHeight: {
//                     xs: "60vh",
//                     sm: "70vh",
//                     md: "calc(100vh - 350px)",
//                   },
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
//                       ].map((header) => (
//                         <TableCell
//                           key={header}
//                           sx={{
//                             fontWeight: 600,
//                             backgroundColor: "#FAFAFA",
//                             fontFamily: "'Inter', sans-serif",
//                             fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                             p: { xs: 1, sm: 1.5 },
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
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.po_no}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {formatDate(po.po_date)}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.po_type || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.pay_mode || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.discount || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.sub_total}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.grand_total}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.vds_total || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.tds_total || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {organizations.find((org) => org.id === po.vendor_id)?.name || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {organizations.find((org) => org.id === po.store_id)?.name || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.currency || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.subject || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.remarks || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.company_code || "N/A"}
//                         </TableCell>

//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.created_by || "N/A"}
//                         </TableCell>

//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.modified_by || "N/A"}
//                         </TableCell>
//                         <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
//                           {po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A"}
//                         </TableCell>
//                         <TableCell>
//                           <IconButton
//                             onClick={() => handleViewDetails(po.id)}
//                             sx={{ color: "#10B981", "&:hover": { bgcolor: "#ecfdf5" } }}
//                           >
//                             <VisibilityIcon fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             onClick={() => handlePrint(po)}
//                             sx={{ color: "#3B82F6", "&:hover": { bgcolor: "#eff6ff" } }}
//                           >
//                             <PrintIcon fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             onClick={() => handleEdit(po)}
//                             sx={{ color: "#6366F1", "&:hover": { bgcolor: "#eef2ff" } }}
//                           >
//                             <EditIcon fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             onClick={() => handleDelete(po.id)}
//                             sx={{ color: "#EF4444", "&:hover": { bgcolor: "#fef2f2" } }}
//                           >
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <TablePagination
//                 rowsPerPageOptions={[5, 10, 25]}
//                 component="div"
//                 count={filteredPurchaseOrders.length}
//                 rowsPerPage={rowsPerPage}
//                 page={page}
//                 onPageChange={handleChangePage}
//                 onRowsPerPageChange={handleChangeRowsPerPage}
//                 sx={{
//                   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
//                     fontFamily: "'Inter', sans-serif",
//                     fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                   },
//                 }}
//               />
//             </Paper>
//           </>
//         )}

//         {/* View Purchase Order Details Dialog */}
//         <Dialog
//           open={viewDetailsOpen}
//           onClose={() => setViewDetailsOpen(false)}
//           maxWidth="lg"
//           fullWidth
//           sx={{
//             "& .MuiDialog-paper": {
//               borderRadius: "16px",
//               bgcolor: "#ffffff",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
//               m: { xs: 1, sm: 2 },
//             },
//           }}
//         >
//           <DialogTitle
//             sx={{
//               fontFamily: "'Poppins', sans-serif",
//               fontWeight: 600,
//               fontSize: { xs: "1.25rem", sm: "1.5rem" },
//               bgcolor: "#FAFAFA",
//               color: "#111827",
//               py: { xs: 2, sm: 3 },
//               px: { xs: 2, sm: 4 },
//               borderBottom: "1px solid #e5e7eb",
//             }}
//           >
//             Purchase Order Details - PO #{purchaseOrders.find((po) => po.id === selectedPoId)?.po_no || "N/A"}
//           </DialogTitle>
//           <DialogContent sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#f9fafb" }}>
//             <Paper
//               elevation={0}
//               sx={{
//                 borderRadius: "12px",
//                 border: "1px solid rgba(0,0,0,0.05)",
//                 overflow: "hidden",
//                 bgcolor: "#ffffff",
//               }}
//             >
//               {detailsError && (
//                 <Typography
//                   color="error"
//                   sx={{
//                     p: 2,
//                     fontFamily: "'Inter', sans-serif",
//                     fontSize: { xs: "0.875rem", sm: "1rem" },
//                   }}
//                 >
//                   {detailsError}
//                 </Typography>
//               )}
//               {detailsLoading ? (
//                 <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
//                   <CircularProgress size={isMobile ? 24 : 40} />
//                 </Box>
//               ) : poDetails.length === 0 ? (
//                 <Typography
//                   sx={{
//                     p: 2,
//                     fontFamily: "'Inter', sans-serif",
//                     fontSize: { xs: "0.875rem", sm: "1rem" },
//                     color: "#6b7280",
//                   }}
//                 >
//                   No product details found for Purchase Order ID {selectedPoId} (PO No:{" "}
//                   {purchaseOrders.find((po) => po.id === selectedPoId)?.po_no || "N/A"}). Please verify that
//                   purchase_order_detail.po_id matches the PurchaseOrder.po_id in the database.
//                 </Typography>
//               ) : (
//                 <TableContainer sx={{ maxHeight: "400px", overflowY: "auto" }}>
//                   <Table stickyHeader>
//                     <TableHead>
//                       <TableRow>
//                         {[
//                           "Line #",
//                           "Product",
//                           "Quantity",
//                           "Unit Price",
//                           "Discount",
//                           "Discount %",
//                           "Total Price",
//                           "VDS %",
//                           "VDS",
//                           "TDS %",
//                           "TDS",
//                         ].map((header) => (
//                           <TableCell
//                             key={header}
//                             sx={{
//                               fontWeight: 600,
//                               backgroundColor: "#FAFAFA",
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               minWidth: header === "Product" ? 200 : 100,
//                               color: "#111827",
//                               borderBottom: "1px solid #e5e7eb",
//                             }}
//                           >
//                             {header}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {poDetails.map((detail) => (
//                         <TableRow
//                           key={detail.id}
//                           hover
//                           sx={{
//                             "&:hover": { bgcolor: "#f4f5f7" },
//                           }}
//                         >
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.line_no || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {products.find((p) => p.id === detail.inv_product_id)?.name || "N/A"} (
//                             {products.find((p) => p.id === detail.inv_product_id)?.code || "N/A"})
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.quantity || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.unit_price || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.discount || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.discount_pct || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.total_price || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.vds_pct || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.vds || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.tds_pct || "N/A"}
//                           </TableCell>
//                           <TableCell
//                             sx={{
//                               fontFamily: "'Inter', sans-serif",
//                               fontSize: { xs: "0.75rem", sm: "0.875rem" },
//                               p: { xs: 1, sm: 1.5 },
//                               color: "#374151",
//                             }}
//                           >
//                             {detail.tds || "N/A"}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               )}
//             </Paper>
//           </DialogContent>
//           <DialogActions
//             sx={{
//               p: { xs: 2, sm: 4 },
//               bgcolor: "#FAFAFA",
//               borderTop: "1px solid #e5e7eb",
//               justifyContent: "flex-end",
//             }}
//           >
//             <Button
//               onClick={() => setViewDetailsOpen(false)}
//               sx={{
//                 textTransform: "none",
//                 fontFamily: "'Inter', sans-serif",
//                 fontSize: { xs: "0.875rem", sm: "1rem" },
//                 color: "#ffffff",
//                 bgcolor: "#6b7280",
//                 "&:hover": { bgcolor: "#4b5563" },
//                 px: { xs: 2, sm: 3 },
//                 py: 1,
//                 borderRadius: "8px",
//               }}
//             >
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </Sidebar>
//   );
// };

// export default PurchaseOrders;







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
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PurchaseOrderDetailsDialog from "./PurchaseOrderDetailsDialog"; // Import the new component

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const PurchaseOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [poDetails, setPoDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
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
      } catch (err) {
        console.error("Error decoding JWT:", err);
        setError("Invalid authentication token");
      }
    }
  }, []);

  console.log(userId);

  // Fetch purchase orders, organizations, and products
  useEffect(() => {
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

  // Fetch purchase order details using PurchaseOrder.po_id
  const fetchPoDetails = async (purchaseOrderId) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setPoDetails([]); // Clear previous details
    try {
      const po = purchaseOrders.find((p) => p.id === purchaseOrderId);
      if (!po) {
        throw new Error(`Purchase Order with id ${purchaseOrderId} not found.`);
      }
      // Use po_id if it exists (indicating a parent PO), otherwise use the PurchaseOrder.id
      const poIdToFetch = po.po_id !== null ? po.po_id : po.id;
      console.log(
        `Fetching details for PurchaseOrder.id=${purchaseOrderId}, po_no=${po.po_no || "N/A"}, using po_id=${poIdToFetch}`
      );
      const response = await axios.get(`http://localhost:5000/api/purchaseorderdetail?po_id=${poIdToFetch}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      console.log(`Fetched PO Details for po_id=${poIdToFetch}:`, response.data, {
        status: response.status,
        headers: response.headers,
      });
      // Filter to ensure PurchaseOrderDetail.po_id matches the po_id we queried
      const filteredDetails = response.data.filter((detail) => detail.po_id === poIdToFetch);
      console.log(`Filtered PO Details (po_id=${poIdToFetch}):`, filteredDetails);
      setPoDetails(filteredDetails || []);
      if (filteredDetails.length === 0) {
        setDetailsError(
          `No product details found for Purchase Order (PO No: ${po.po_no || "N/A"}) with po_id=${poIdToFetch}. Please verify that purchase_order_detail.po_id matches ${poIdToFetch} in the database. Run: SELECT * FROM purchase_order_detail WHERE po_id = ${poIdToFetch};`
        );
        console.warn(
          `No PurchaseOrderDetail records found for po_id=${poIdToFetch}. Verify the database with: SELECT * FROM purchase_order_detail WHERE po_id = ${poIdToFetch};`
        );
      }
    } catch (err) {
      console.error(`Error fetching purchase order details for PurchaseOrder.id=${purchaseOrderId}:`, err);
      setDetailsError("Failed to fetch purchase order details. Please try again or contact support.");
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

  const filteredPurchaseOrders = purchaseOrders.filter(
    (po) =>
      (po.po_no && po.po_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.po_type && po.po_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.subject && po.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.remarks && po.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.company_code && po.company_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentPurchaseOrders = filteredPurchaseOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleEdit = (purchaseOrder) => {
    console.log("Edit PO:", purchaseOrder); // Placeholder
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await axios.delete(`http://localhost:5000/api/purchaseorder/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
      } catch (err) {
        console.error("Error deleting purchase order:", err);
        setError("Failed to delete purchase order");
      }
    }
  };

  const handleViewDetails = (poId) => {
    setPoDetails([]); // Clear previous details
    setSelectedPoId(poId);
    fetchPoDetails(poId);
    setViewDetailsOpen(true);
  };

  const handlePrint = async (po) => {
    // Fetch fresh details using po_id
    const poIdToFetch = po.po_id !== null ? po.po_id : po.id;
    await fetchPoDetails(po.id); // Fetch details using the updated logic
    const vendor = organizations.find((org) => org.id === po.vendor_id)?.name || "N/A";
    const store = organizations.find((org) => org.id === po.store_id)?.name || "N/A";
    const parentPo = po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A";

    const printContent = `
      <html>
        <head>
          <title>Purchase Order ${po.po_no}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 20px; }
            h1 { font-size: 24px; color: #1f2937; }
            h2 { font-size: 18px; color: #1f2937; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: 600; }
            .info-grid { display: grid; grid-template-columns: auto auto; gap: 10px; margin-bottom: 20px; }
            .label { font-weight: 600; color: #6b7280; }
            .no-details { color: #6b7280; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Purchase Order: ${po.po_no}</h1>
          <div class="info-grid">
            <span class="label">PO Date:</span><span>${formatDate(po.po_date)}</span>
            <span class="label">PO Type:</span><span>${po.po_type || "N/A"}</span>
            <span class="label">Pay Mode:</span><span>${po.pay_mode || "N/A"}</span>
            <span class="label">Vendor:</span><span>${vendor}</span>
            <span class="label">Store:</span><span>${store}</span>
            <span class="label">Currency:</span><span>${po.currency || "N/A"}</span>
            <span class="label">Subtotal:</span><span>${po.sub_total}</span>
            <span class="label">Grand Total:</span><span>${po.grand_total}</span>
            <span class="label">Discount:</span><span>${po.discount || "N/A"}</span>
            <span class="label">VDS Total:</span><span>${po.vds_total || "N/A"}</span>
            <span class="label">TDS Total:</span><span>${po.tds_total || "N/A"}</span>
            <span class="label">Subject:</span><span>${po.subject || "N/A"}</span>
            <span class="label">Remarks:</span><span>${po.remarks || "N/A"}</span>
            <span class="label">Company Code:</span><span>${po.company_code || "N/A"}</span>
            <span class="label">Parent PO:</span><span>${parentPo}</span>
            <span class="label">Created:</span><span>${formatDate(po.created)}</span>
            <span class="label">Created By:</span><span>${po.created_by || "N/A"}</span>
            <span class="label">Modified:</span><span>${formatDate(po.modified)}</span>
            <span class="label">Modified By:</span><span>${po.modified_by || "N/A"}</span>
          </div>
          <h2>Order Details</h2>
          ${
            poDetails.length === 0
              ? `<p class="no-details">No product details found for this purchase order (po_id: ${poIdToFetch}).</p>`
              : `
          <table>
            <tr>
              <th>Line #</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Discount %</th>
              <th>Total Price</th>
              <th>VDS %</th>
              <th>VDS</th>
              <th>TDS %</th>
              <th>TDS</th>
            </tr>
            ${poDetails
              .map(
                (detail) => `
                  <tr>
                    <td>${detail.line_no || "N/A"}</td>
                    <td>${products.find((p) => p.id === detail.inv_product_id)?.name || "N/A"} (${
                      products.find((p) => p.id === detail.inv_product_id)?.code || "N/A"
                    })</td>
                    <td>${detail.quantity || "N/A"}</td>
                    <td>${detail.unit_price || "N/A"}</td>
                    <td>${detail.discount || "N/A"}</td>
                    <td>${detail.discount_pct || "N/A"}</td>
                    <td>${detail.total_price || "N/A"}</td>
                    <td>${detail.vds_pct || "N/A"}</td>
                    <td>${detail.vds || "N/A"}</td>
                    <td>${detail.tds_pct || "N/A"}</td>
                    <td>${detail.tds || "N/A"}</td>
                  </tr>
                `
              )
              .join("")}
          </table>
          `
          }
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Helper to format dates for display
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  return (
    <Sidebar>
      <Box sx={{ width: "100%", p: { xs: 2, sm: 4 }, bgcolor: "#f9fafb" }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#111827",
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "1.25rem", sm: "2rem" },
              textAlign:"left"
            }}
          >
            Purchase Orders
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Typography
            color="error"
            sx={{ mb: 2, fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {error}
          </Typography>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={isMobile ? 24 : 40} />
          </Box>
        ) : (
          <>
            {/* PO Type Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {poTypeData.map((type) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={type.name}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "16px",
                      height: "100%",
                      border: "1px solid rgba(0,0,0,0.05)",
                      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Avatar
                          sx={{
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40,
                            backgroundColor: type.color,
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
                            sx={{ fontFamily: "'Inter', sans-serif" }}
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

            {/* Search Tools */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "flex-start",
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
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
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
              <TableContainer
                sx={{
                  maxHeight: {
                    xs: "60vh",
                    sm: "70vh",
                    md: "calc(100vh - 350px)",
                  },
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
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: 600,
                            backgroundColor: "#FAFAFA",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            p: { xs: 1, sm: 1.5 },
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
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.po_no}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {formatDate(po.po_date)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.po_type || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.pay_mode || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.discount || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.sub_total}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.grand_total}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.vds_total || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.tds_total || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {organizations.find((org) => org.id === po.vendor_id)?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {organizations.find((org) => org.id === po.store_id)?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.currency || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.subject || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.remarks || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.company_code || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.created_by || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.modified_by || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          {po.po_id ? purchaseOrders.find((p) => p.id === po.po_id)?.po_no || "N/A" : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              gap: { xs: 0.5, sm: 1 },
                              alignItems: "center",
                              bgcolor: "#f9fafb",
                              p: { xs: 0.5, sm: 1 },
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
                                p: { xs: 0.5, sm: 0.75 },
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
                                p: { xs: 0.5, sm: 0.75 },
                              }}
                            >
                              <PrintIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleEdit(po)}
                              sx={{
                                color: "#6366F1",
                                bgcolor: "rgba(99, 102, 241, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(99, 102, 241, 0.2)",
                                },
                                borderRadius: "50%",
                                p: { xs: 0.5, sm: 0.75 },
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
                                p: { xs: 0.5, sm: 0.75 },
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
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
              />
            </Paper>

            {/* View Purchase Order Details Dialog */}
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
          </>
        )}
      </Box>
    </Sidebar>
  );
};

export default PurchaseOrders;
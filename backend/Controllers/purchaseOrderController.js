const PurchaseOrder = require('../Models/PurchaseOrder');
const Organization = require('../Models/Organization');

// Create a new Purchase Order
const createPurchaseOrder = async (req, res) => {
  const {
    po_no, po_date, po_type, pay_mode, discount, sub_total, grand_total,
    vds_total, tds_total, vendor_id, store_id, currency, subject, remarks,
    company_code, created_by, modified_by, po_id
  } = req.body;

  try {
    const newPurchaseOrder = await PurchaseOrder.create({
      po_no,
      po_date,
      po_type,
      pay_mode,
      discount,
      sub_total,
      grand_total,
      vds_total,
      tds_total,
      vendor_id,
      store_id,
      currency,
      subject,
      remarks,
      company_code,
      created_by,
      modified_by,
      po_id,
    });

    res.status(201).json({
      message: 'Purchase Order created successfully',
      purchaseOrder: newPurchaseOrder,
    });
  } catch (error) {
    console.error('Error creating Purchase Order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all Purchase Orders
const getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.findAll();
    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching Purchase Orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Purchase Order by ID
const getPurchaseOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }
    res.status(200).json(purchaseOrder);
  } catch (error) {
    console.error('Error fetching Purchase Order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Purchase Order
const updatePurchaseOrder = async (req, res) => {
  const { id } = req.params;
  const {
    po_no, po_date, po_type, pay_mode, discount, sub_total, grand_total,
    vds_total, tds_total, vendor_id, store_id, currency, subject, remarks,
    company_code, modified_by, po_id
  } = req.body;

  try {
    const [updated] = await PurchaseOrder.update(
      {
        po_no, po_date, po_type, pay_mode, discount, sub_total, grand_total,
        vds_total, tds_total, vendor_id, store_id, currency, subject, remarks,
        company_code, modified_by, po_id
      },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    const updatedPurchaseOrder = await PurchaseOrder.findByPk(id);
    res.status(200).json({
      message: 'Purchase Order updated successfully',
      purchaseOrder: updatedPurchaseOrder,
    });
  } catch (error) {
    console.error('Error updating Purchase Order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete Purchase Order
const deletePurchaseOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await PurchaseOrder.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }
    res.status(200).json({ message: 'Purchase Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting Purchase Order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
};

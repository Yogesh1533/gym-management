const Lead = require('../models/Lead');

// Public: free-trial request from the website
const createLead = async (req, res) => {
  try {
    const { name, email, phone, goal, message } = req.body;
    await Lead.create({ name: name.trim(), email: email.toLowerCase().trim(), phone: phone || null, goal: goal || null, message: message || null });
    res.status(201).json({ message: "Thanks! Our team will contact you within 24 hours to book your free trial." });
  } catch (err) {
    res.status(500).json({ message: 'Could not submit your request. Please try again.' });
  }
};

const getLeads = async (req, res) => {
  try {
    res.json(await Lead.findAll({ order: [['createdAt', 'DESC']] }));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const { status } = req.body;
    if (!['new', 'contacted', 'converted', 'closed'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    await lead.update({ status });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update lead' });
  }
};

const deleteLead = async (req, res) => {
  try {
    await Lead.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

module.exports = { createLead, getLeads, updateLead, deleteLead };

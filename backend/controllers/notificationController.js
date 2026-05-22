const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { recipientId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ notifications, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, recipientId: req.user.id } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { recipientId: req.user.id, isRead: false } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({ where: { recipientId: req.user.id, isRead: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllRead, getUnreadCount };

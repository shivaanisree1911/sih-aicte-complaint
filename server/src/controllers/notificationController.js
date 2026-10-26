import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getNotifications(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId: req.user._id, isRead: false })
    ]);

    return sendSuccess(res, 'Notifications retrieved.', {
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Notification not found.', 404);
    }

    return sendSuccess(res, 'Notification marked as read.', { notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
}

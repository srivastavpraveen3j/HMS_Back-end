import Notification from '../models/notification.model.js';

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const getUserNotifications = async (userId, limit = 20) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );
};

export const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

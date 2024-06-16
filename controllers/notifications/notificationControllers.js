import asyncHandler from "express-async-handler";
import { Notification } from "../../models/Notification/Notification.js";
import mongoose from "mongoose";

const notificationControllers = {

  //! List notifications
  listAllNotifications: asyncHandler(async (req, res) => {
    const allNotifications = await Notification.find();
    res.json({
      status: "success",
      message: "Notifications fetched successfully",
      allNotifications,
    });
  }),
  //! Update a category
  updateNotification: asyncHandler(async (req, res) => {

    const notificationId = req.params.notificationId;
    
    // Check validity of notofocation ID
    const isValidId = mongoose.Types.ObjectId.isValid(notificationId)

    if (!isValidId) {
      throw new Error('Invalid notification ID')
    }
    
    //find notification in model and update isRead field
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true
      },
      { new: true }
    );
    res.json({
      status: "success",
      message: "Notification updated successfully",
      updatedNotification,
    });
  }),
};

export default notificationControllers;  

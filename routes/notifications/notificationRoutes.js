import express from "express";
import notificationControllers from "../../controllers/notifications/notificationControllers.js";

const router = express.Router();
 


  //! List notifications
router.get("/", notificationControllers.listAllNotifications);

  //! Update a notification
router.put("/:notificationId", notificationControllers.updateNotification);


export default router;
import admin from "firebase-admin";

export default {
  sendPushNotificationToDashboard: async (req, res, next) => {
    try {
      const appointmentData = req.body; // Get appointment data from req.body

      // Construct the message to be sent
      const message = {
        data: {
          appointmentId: appointmentData._id, // Use appointmentData._id to get the appointment ID
          title: "New Appointment",
          body: "New appointment scheduled",
        },
        token: appointmentData.fcm_token, // Use appointmentData.fcm_token to get the FCM token
      };

      // Send the message
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);

      // Handle the response here if necessary
      res.status(200).json({ response });
    } catch (error) {
      console.error("Error sending push notification:", error);
      res.status(500).json({ error: "Error sending push notification" });
    }
  },
};

import admin from "firebase-admin";

export default {
  sendPushNotificationToDashboard: async (req, res, next) => {
    try {
      const appointmentData = req.body; // Use req.body para obter os dados do agendamento

      const message = {
        data: {
          appointmentId: "appointmentData._id",
          title: "Neuer Termin",
          body: "Neue Terminplanung",
        },
        token: appointmentData.fcm_token, // Use appointmentData.fcm_token para obter o token
      };

      // Envia a mensagem
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);

      // Aqui você pode manipular a resposta, se necessário
      res.status(200).json({ response });
    } catch (error) {
      console.error("Error sending push notification:", error);
      res.status(500).json({ error: "Error sending push notification" });
    }
  },
};

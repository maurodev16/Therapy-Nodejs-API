import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Appointment from "../models/appointmentSchema.js";
import checkToken from "../middleware/checkToken.js";
import Invoice from "../models/invoiceSchema.js";
import * as OneSignal from "@onesignal/node-onesignal";

dotenv.config();
const router = express.Router();

// Função para verificar a disponibilidade
async function checkAvailability(date, time) {
  try {
    // Consulta o banco de dados para verificar se a date e hora já foram reservadas
    const existingAppointment = await Appointment.findOne({ date, time });
    console.log(date);
    console.log(time);

    // Retorna verdadeiro se estiver disponível, falso se já estiver reservado
    return !existingAppointment;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error; // Rejeita a promessa se ocorrer um erro
  }
}
// Função para enviar notificação OneSignal
async function sendOneSignalNotification(appointmentData, userData) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_API_CREDENTIAL}`,
        "Content-Type": "application/json",
      },
      notification: OneSignal.Notification({}),
      body: JSON.stringify({
        app_id: process.env.ONESIGAL_APP_ID,
        include_player_ids: [process.env.ONESIGNAL_include_player_ids],
        contents: {
          en: `Neuer Termin erstellt von: ${userData.first_name} ${userData.last_name}`,
        },
       
        big_picture:
          "https://res.cloudinary.com/dhkyslgft/image/upload/v1696606566/assets/no-data_favk5j.jpg",
      }),
    });

    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error("Error sending OneSignal notification:", error.message);
  }
}

router.post("/create-appointment", checkToken, async (req, res) => {
  try {
    const appointmentData = req.body;
    const userId = req.auth._id;

    const user_obj = await User.findById(userId).select("-password");
    if (!user_obj) {
      return res.status(404).send("User not found");
    }

    const isAvailable = await checkAvailability(
      appointmentData.date,
      appointmentData.time
    );

    if (isAvailable) {
      const appointment = await Appointment({
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes,
        service_type_obj: appointmentData.service_type_obj,
        user_obj: user_obj,
        status: appointmentData.status,
      });

      const newAppointment = await appointment.save();

      // Envie uma notificação para o usuário do dashboard
      await sendOneSignalNotification(newAppointment, user_obj);

      res.status(200).json(newAppointment);
    } else {
      res.status(409).json({ DATA_END_TIME_NOT_AVAIABLE: isAvailable });
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).send("ERROR_CREATE_APPOINT");
  }
});

router.get("/fetch-all-appointments", checkToken, async (req, res) => {
  try {
    // Use a consulta find com o campo indexado
    const currentDate = new Date();

    // Recupere a lista atualizada de compromissos
    const appointments = await Appointment.find({})
      .sort({ date: 1 })
      .select("-__v")
      .populate(
        "user_obj",
        "client_number first_name last_name email phone user_type"
      )
      .populate("invoice_obj", "invoice_url over_duo status");

    // Atualize o status com base na data e hora de cada compromisso
    for (const appointment of appointments) {
      const appointmentDateTime = new Date(
        appointment.date.getFullYear(),
        appointment.date.getMonth(),
        appointment.date.getDate(),
        appointment.time.getHours(),
        appointment.time.getMinutes(),
        0,
        0
      );

      // Atualize o status para "done" se o compromisso passou da data e da hora
      if (appointmentDateTime < currentDate && appointment.status === "open") {
        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: { status: "done" } }
        );
      }

      // Atualize o status para "open" se o compromisso é futuro e o status é "done"
      if (appointmentDateTime > currentDate && appointment.status === "done") {
        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: { status: "open" } }
        );
      }
    }

    // Recupere a lista atualizada de compromissos após as atualizações
    const updatedAppointments = await Appointment.find({})
      .sort({ date: 1 })
      .select("-__v")
      .populate(
        "user_obj",
        "client_number first_name last_name email phone user_type"
      )
      .populate("invoice_obj", "invoice_url over_duo status");

    res.status(200).json(updatedAppointments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//***************************************************************** */

router.get(
  "/fetch-appointments-by-user/:user_id",
  checkToken,
  async (req, res) => {
    try {
      const userId = req.params._id;
      const appointments = await Appointment.find({ user: userId })
        .sort({ createdAt: 1 })
        .select("-__v")
        .populate(
          "user_obj",
          "client_number first_name last_name email phone user_type"
        )
        .populate("invoice_obj", "invoice_url over_duo status");
      // Atualize o status para "done" se o compromisso passou da data e da hora
      for (const appointment of appointments) {
        const appointmentDateTime = new Date(
          appointment.date.getFullYear(),
          appointment.date.getMonth(),
          appointment.date.getDate(),
          appointment.time.getHours(),
          appointment.time.getMinutes(),
          0,
          0
        );
        if (
          appointmentDateTime < currentDate &&
          appointment.status === "open"
        ) {
          await Appointment.updateMany(
            { _id: appointment._id },
            { $set: { status: "done" } }
          );
        }

        // Atualize o status para "open" se o compromisso é futuro e o status é "done"
        if (
          appointmentDateTime > currentDate &&
          appointment.status === "done"
        ) {
          await Appointment.updateMany(
            { _id: appointment._id },
            { $set: { status: "open" } }
          );
        }
      }

      if (appointments.length === 0) {
        return res.status(404).json({ msg: "appointment not found" });
      }
      const updatedAppointments = await Appointment.find({ user: userId })
        .sort({ createdAt: 1 })
        .select("-__v")
        .populate(
          "user_obj",
          "client_number first_name last_name email phone user_type"
        )
        .populate("invoice_obj", "invoice_url over_duo status");
      res.status(201).json(updatedAppointments); // Retorna os appointments encontrados
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.post("/cancel-appointment/:appointmentId", async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const user_id = req.body.user_id; // Certifique-se de pegar o campo correto do corpo da solicitação

  try {
    // Verifique se o compromisso existe
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verifique se o usuário é o proprietário do compromisso ou é um administrador
    if (
      appointment.user_obj.equals(user_id) ||
      user_id === "655c7332b35063d3cbc1e5be"
    ) {
      // Atualize o status para "canceled" e registre quem cancelou
      appointment.status = "canceled";
      appointment.canceled_by = user_id;
      await appointment.save();

      res.status(200).json(appointment);
    } else {
      res.status(403).json({ error: "Permission denied" });
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

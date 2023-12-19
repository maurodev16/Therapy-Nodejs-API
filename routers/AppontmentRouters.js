import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Appointment from "../models/appointmentSchema.js";
import checkToken from "../middleware/checkToken.js";
import Invoice from "../models/invoiceSchema.js";
import * as OneSignal from "@onesignal/node-onesignal";
import request from 'request';
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
  const API_KEY = process.env.ONESIGNAL_API_CREDENTIAL;
  const ONESIGNAL_APP_ID = process.env.ONESIGAL_APP_ID;
  const BASE_URL = "https://onesignal.com/api/v1";
  try {
    /**
     * OPTIONS BUILDER
     * @param {string} method
     * @param {string} path
     * @param {object} body
     * @returns {object} options
     */
    const optionsBuilder = (method, path, body) => {
      return {
        method,
        url: `${BASE_URL}/${path}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${API_KEY}`,
        },
        body: body ? JSON.stringify(body) : null,
      };
    };
    /**
     * CREATE A PUSH NOTIFICATION
     * method: POST
     * Postman: https://www.postman.com/onesignaldevs/workspace/onesignal-api/request/16845437-c4f3498f-fd80-4304-a6c1-a3234b923f2c
     * API Reference: https://documentation.onesignal.com/reference#create-notification
     * path: /notifications
     * @param {object} body
     */
    const createNotication = async (body) => {
      const options = optionsBuilder("POST", "notifications", body);
      console.log(options);
      request(options, (error, response) => {
        if (error) throw new Error(error);
        console.log(response.body);
        viewNotifcation(JSON.parse(response.body).id);
      });
    };

    /**
     * VIEW NOTIFICATION
     * method: GET
     * Postman: https://www.postman.com/onesignaldevs/workspace/onesignal-api/request/16845437-6c96ecf0-5882-4eac-a386-0d0cabc8ecd2
     * API Reference: https://documentation.onesignal.com/reference#view-notification
     * path: /notifications/{notification_id}?app_id=${ONE_SIGNAL_APP_ID}
     * @param {string} notificationId
     */
    const viewNotifcation = (notificationId) => {
      const path = `notifications/${notificationId}?app_id=${ONESIGNAL_APP_ID}`;
      const options = optionsBuilder("GET", path);
      request(options, (error, response) => {
        if (error) throw new Error(error);
        console.log(response.body);
      });
    };
    const body = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'],

      //include_player_ids: [],
      data: {
        foo: "bar",
      },
      contents: {
        en: `Neuer Termin erstellt von: ${userData.first_name} ${userData.last_name}`,
      },

      big_picture:
        "https://res.cloudinary.com/dhkyslgft/image/upload/v1696606566/assets/no-data_favk5j.jpg",
    };
    const responseData = await createNotication(body);
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
console.log(appointment)
      const newAppointment = await appointment.save();

      // Envie uma notificação para o usuário do dashboard
      await sendOneSignalNotification(newAppointment, user_obj);

      res.status(200).json(newAppointment);
    } else {
      res.status(409).json({ DATA_END_TIME_NOT_AVAIABLE: isAvailable });
    }
  } catch (error) {
console.log(error)

    res.status(500).json({error:"ERROR_CREATE_APPOINT"});
  }
});

router.get("/fetch-all-appointments", checkToken, async (req, res) => {
  try {
    // Use a consulta find com o campo indexado
    const currentDate = Date.now();

    // Recupere a lista atualizada de compromissos
    const appointments = await Appointment.find({})
      .sort({ date: 1 })
      .select("-__v")
      .populate( "user_obj", "client_number first_name last_name email phone user_type")
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
    const currentDate =  Date.now();
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

router.patch("/cancel-appointment/:appointmentId",checkToken, async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const user_id = req.body.user_id; 

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verifique se o compromisso existe
    const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    if (appointment.status === "canceled") {
      return res.status(403).json({ msg: "Appointment has already been canceled" });
    }
  
    // Verifique se o usuário é o proprietário do compromisso ou é um administrador
    if (
      appointment.user_obj.equals(user._id) || user.user_type ==="admin"
    ) {
      // Atualize o status para "canceled" e registre quem cancelou
      appointment.status = "canceled";
      appointment.canceled_by = user._id;
      await appointment.save();


      res.status(200).send(appointment);
    } else {
      res.status(403).json({ msg: "Permission denied" });
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

export default router;

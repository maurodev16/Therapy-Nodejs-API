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

// Function to check availability of appointment date and time
async function checkAvailability(date, time) {
  try {
    // Query the database to check if the date and time are already booked
    const existingAppointment = await Appointment.findOne({ date, time });

    // Return true if available, false if already booked
    return !existingAppointment;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
}

// Function to send OneSignal notification
async function sendOneSignalNotification(appointmentData, userData) {
  const API_KEY = process.env.ONESIGNAL_API_CREDENTIAL;
  const ONESIGNAL_APP_ID = process.env.ONESIGAL_APP_ID;
  const BASE_URL = "https://onesignal.com/api/v1";

  try {
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

    const createNotication = async (body) => {
      const options = optionsBuilder("POST", "notifications", body);
      request(options, (error, response) => {
        if (error) throw new Error(error);
        console.log(response.body);
        viewNotifcation(JSON.parse(response.body).id);
      });
    };

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
      data: {
        foo: "bar",
      },
      contents: {
        en: `New appointment created by: ${userData.first_name} ${userData.last_name}`,
      },
      big_picture: "https://res.cloudinary.com/dhkyslgft/image/upload/v1696606566/assets/no-data_favk5j.jpg",
    };
    const responseData = await createNotication(body);
    console.log(responseData);
  } catch (error) {
    console.error("Error sending OneSignal notification:", error.message);
  }
}

// Route to create an appointment
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

      // Send a notification to the user from the dashboard
      await sendOneSignalNotification(newAppointment, user_obj);

      res.status(200).json(newAppointment);
    } else {
      res.status(409).json({ DATA_END_TIME_NOT_AVAIABLE: isAvailable });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ERROR_CREATE_APPOINT" });
  }
});

// Route to fetch all appointments
router.get("/fetch-all-appointments", checkToken, async (req, res) => {
  try {
    const currentDate = Date.now();

    // Retrieve the updated list of appointments
    const appointments = await Appointment.find({})
      .sort({ date: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone user_type")
      .populate("invoice_obj", "invoice_url over_duo status");

    // Update status based on date and time for each appointment
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

      // Update status to "done" if the appointment has passed its date and time
      if (appointmentDateTime < currentDate && appointment.status === "open") {
        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: { status: "done" } }
        );
      }

      // Update status to "open" if the appointment is in the future and status is "done"
      if (appointmentDateTime > currentDate && appointment.status === "done") {
        await Appointment.updateOne(
          { _id: appointment._id },
          { $set: { status: "open" } }
        );
      }
    }

    // Retrieve the updated list of appointments after updates
    const updatedAppointments = await Appointment.find({})
      .sort({ date: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone user_type")
      .populate("invoice_obj", "invoice_url over_duo status");

    res.status(200).json(updatedAppointments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to fetch appointments by user ID
router.get("/fetch-appointments-by-user/:user_id", checkToken, async (req, res) => {
  const currentDate = Date.now();
  try {
    const userId = req.params._id;
    const appointments = await Appointment.find({ user: userId })
      .sort({ createdAt: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone user_type")
      .populate("invoice_obj", "invoice_url over_duo status");

    // Update status to "done" if the appointment has passed its date and time
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
      if (appointmentDateTime < currentDate && appointment.status === "open") {
        await Appointment.updateMany(
          { _id: appointment._id },
          { $set: { status: "done" } }
        );
      }

      // Update status to "open" if the appointment is in the future and status is "done"
      if (appointmentDateTime > currentDate && appointment.status === "done") {
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
      .populate("user_obj", "client_number first_name last_name email phone user_type")
      .populate("invoice_obj", "invoice_url over_duo status");
    res.status(201).json(updatedAppointments); // Return the found appointments
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to cancel an appointment
router.patch("/cancel-appointment/:appointmentId", checkToken, async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const user_id = req.body.user_id; 

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    if (appointment.status === "canceled") {
      return res.status(403).json({ msg: "Appointment has already been canceled" });
    }
  
    // Check if the user is the owner of the appointment or is an admin
    if (
      appointment.user_obj.equals(user._id) || user.user_type ==="admin"
    ) {
      // Update status to "canceled" and record who canceled
      appointment.status = "canceled";
      appointment.canceled_by = `${user.first_name} ${user.last_name}`;
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

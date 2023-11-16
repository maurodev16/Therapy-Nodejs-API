require("dotenv").config();
const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const Appointment = require("../models/appointmentSchema");
const checkToken = require("../middleware/checkToken");


// Função para verificar a disponibilidade
async function checkAvailability(date, time) {
  try {
    // Consulta o banco de dados para verificar se a date e hora já foram reservadas
    const existingAppointment = await Appointment.findOne({ date, time });

    // Retorna verdadeiro se estiver disponível, falso se já estiver reservado
    return !existingAppointment;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error; // Rejeita a promessa se ocorrer um erro
  }
}
// Rota para criar um novo agendamento
router.post("/create-appointment",checkToken, async (req, res) => {
  try {
    const appointmentdate = req.body;

    const userId = req.auth.user_id;
    console.log(userId);

    const userObj = await User.findById(userId).select("-password");
    console.log(userObj);
    if (!userObj) {
      return res.status(404).send("User not found");
    }

    // Verifica se a date e hora estão disponíveis
    const isAvailable = await checkAvailability(appointmentdate.date, appointmentdate.time);

    if (isAvailable) {
      // Cria o agendamento se estiver disponível
      const appointment = await Appointment({
        date: appointmentdate.date,
        time: appointmentdate.time,
        notes: appointmentdate.notes,
        service_type_obj: appointmentdate.service_type_obj,
        Payment_obj: appointmentdate.Payment_obj,
        related_documents_obj: appointmentdate.related_documents_obj,
        is_canceled: appointmentdate.is_canceled,
        status: appointmentdate.status,
        user_obj: userObj,
      });
      const newAppointment = await appointment.save();
      res.status(200).json(newAppointment);
    } else {
      // Informa ao cliente que a date e hora não estão disponíveis
      res.status(409).send("DATA_END_TIME_NOT_AVAIABLE");
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).send("ERROR_CREATE_APPOINT");
  }
});

// Rota para obter compromissos por date
router.get("/fetch-all-appointments", checkToken, async (req, res) => {
  try {
    
    // Use a consulta find com o campo indexado
    const appointments = await Appointment.find({})
    .sort({ createdAt: 1 })
    .select("-__v")
    .populate("user_obj", "client_number firstname lastname email user_type");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/fetch-appointments-by-user/:user_id", async (req, res) => {
    try {
      const userId = req.params.user_id;
      const appointments = await Appointment.find({ user: userId })
      .sort({ createdAt: 1 })
      .select("-__v")
      .populate("user_obj", "client_number firstname lastname email user_type");
  
      if (appointments.length === 0) {
        return res.status(404).json({ msg: "appointment not found" });
      }
  
      return res.status(201).json(appointments); // Retorna os appointments encontrados
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  router.get("/fetch-all-appointments", checkToken, async (req, res) => {
    try {
      const { user_id } = req.query;
  
      // Use a consulta find com o campo indexado
      const appointments = await Appointment.find({ user_id })
        .sort({ createdAt: 1 })
        .select("-__v")
        .populate("user_obj", "client_number firstname lastname email user_type");
  
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
module.exports = router;

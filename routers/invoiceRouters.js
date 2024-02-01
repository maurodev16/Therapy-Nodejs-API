import express from "express";
const router = express.Router();
import cloudinary from "../services/cloudinaryConfig.js";
import Invoice from "../models/invoiceSchema.js";
import User from "../models/userSchema.js";
import Appointment from "../models/appointmentSchema.js";
import uploadSingleInvoice from "../middleware/multerSingleInvoiceMiddleware.js";
import checkToken from "../middleware/checkToken.js";

// Helper function to update invoice status
async function updateInvoiceStatus(invoiceId, newStatus) {
  await Invoice.updateOne({ _id: invoiceId }, { $set: { status: newStatus } });
}

// Route to create a new invoice
router.post(
  "/create-invoice",
  checkToken,
  uploadSingleInvoice.single("file"),
  async (req, res) => {
    try {
      const invoiceData = await req.body;

      // Check if the user exists
      const user = await User.findById(invoiceData.user_obj).select(
        "-password"
      );
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the current user is an admin
      if (user.user_type !== "admin") {
        return res
          .status(403)
          .send("Permission denied. Only admins can create invoices.");
      }

      // Check if the appointment exists
      const appointment = await Appointment.findById(
        invoiceData.appointment_obj
      );

      if (!appointment) {
        return res.status(400).json({ error: "Appointment not found" });
      }

      // Check if photos for the gallery have been sent
      if (!req.file || req.file.length === 0) {
        return res.status(400).send("No file provided");
      }

      const file = req.file;
      const invoice_name = `${file.originalname.split(".")[0]}`;

      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "raw",
        allowedFormats: ["jpg", "png", "pdf"],
        public_id: invoice_name,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
      });

      if (!result.secure_url) {
        return res.status(500).send("Error uploading Invoice to cloudinary");
      }

      // Create the invoice in the Invoice schema
      const invoice = new Invoice({
        invoice_url: result.secure_url,
        invoice_name: invoice_name,
        user_obj: appointment.user_obj,
        appointment_obj: appointment._id,
        over_duo: invoiceData.over_duo,
        create_by: user.user_type,
        status: invoiceData.status,
      });

      // Check if appointment.invoice_obj is null or undefined
      if (!appointment.invoice_obj) {
        // If it is null or undefined, initialize as an empty array
        appointment.invoice_obj = [];
      }

      // Now you can safely call push
      appointment.invoice_obj.push(invoice._id);

      // Update the number of invoices
      appointment.invoice_qnt = appointment.invoice_obj.length;

      // Save the changes to the appointment
      await appointment.save();

      // Save the invoice in the database
      await invoice.save();

      res.status(200).json(invoice);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route to get and update invoice status based on dates
router.get("/fetch-invoices", checkToken, async (req, res) => {
  try {
    const currentDate = Date.now();
    const invoices = await Invoice.find({})
      .sort({ over_due: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone")
      .populate("appointment_obj", "status");

    for (const invoice of invoices) {
      switch (invoice.status) {
        case "open":
          if (invoice.over_duo < currentDate && invoice.status == "open") {
            await updateInvoiceStatus(invoice._id, "overduo");
          }
          break;

        default:
          // Logic to handle other statuses, if needed
      }
    }

    const updatedInvoices = await Invoice.find({})
      .sort({ over_due: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone")
      .populate("appointment_obj", "status");

    res.status(200).json(updatedInvoices);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Route to fetch invoices by user Id
router.get("/fetch-invoices-by-user-id/:user_id", async (req, res) => {
  try {
    const currentDate = Date.now();
    const userId = req.params._id;
    const invoices = await Invoice.find({ user: userId })
      .sort({ over_due: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone")
      .populate("appointment_obj", "status");

    for (const invoice of invoices) {
      switch (invoice.status) {
        case "open":
          if (invoice.over_duo < currentDate && invoice.status == "open") {
            await updateInvoiceStatus(invoice._id, "overduo");
          }
          break;

        default:
          // Logic to handle other statuses, if needed
      }
    }

    const updatedInvoices = await Invoice.find({ user: userId })
      .sort({ over_due: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone")
      .populate("appointment_obj", "status");

    res.status(200).json(updatedInvoices);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Route to update invoice status based on dates
router.put("/update-invoice-status", async (req, res) => {
  try {
    const currentDate = Date.now();

    // Find all invoices
    const invoices = await Invoice.find({}).sort({ over_due: 1 });

    // Update status to "overduo" if the invoice is overdue and with status OPEN
    for (const invoice of invoices) {
      switch (invoice.status) {
        case "open":
          if (invoice.over_duo < currentDate && invoice.status == "open") {
            await updateInvoiceStatus(invoice._id, "overduo");
          }
          break;

        default:
          // Logic to handle other statuses, if needed
      }
    }

    // Retrieve the updated list of invoices after updates
    const updatedInvoices = await Invoice.find({}).sort({ over_due: 1 });

    res.status(200).json(updatedInvoices);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

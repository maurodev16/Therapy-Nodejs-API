const express = require("express");
const router = express.Router();
const cloudinary = require("../services/cloudinaryConfig");
const Invoice = require("../models/invoiceSchema");
const User = require("../models/userSchema");
const uploadSingleInvoice = require("../middleware/multerSingleInvoiceMiddleware");

// Rota para criar uma nova fatura
router.post(
  "/create-invoice",
  uploadSingleInvoice.single("file"),
  async (req, res) => {
    try {
      const invoiceData = req.body;

      // Verificar se foram enviadas fotos para a galeria
      if (!req.file || req.file.length === 0) {
        return res.status(400).send("No images provided");
      }

      // Verifica se o usuário existe
      const user = await User.findById(invoiceData.user_obj).select(
        "-password"
      );
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const file = req.file;
      const public_id = `${user.last_name}-${user._id}-${
        file.originalname.split(".")[0]
      }`;

      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "raw",
        allowed_formats: ["pdf"],
        public_id: public_id,
        overwrite: false,
        upload_preset: "wasGehtAb_preset",
      });

      if (!result.secure_url) {
        return res.status(500).send("Error uploading Invoice to cloudinary");
      }

      // Cria a fatura no schema Invoice
      const invoice = new Invoice({
        invoice_url: result.secure_url,
        user_obj: user._id,
        over_duo: invoiceData.over_duo,
        status: invoiceData.status,
      });

      // Atualiza os dados do usuário
      user.invoice_obj = invoice._id;
      user.invoice_qnt = (user.invoice_qnt || 0) + 1;
      await user.save();

      // Salva a fatura no banco de dados
      await invoice.save();

      res.status(200).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Rota para obter e atualizar o status das faturas com base nas datas
router.get("/fetch-invoices", async (req, res) => {
  try {
    const currentDate = new Date();

    // Encontre todas as faturas
    const invoices = await Invoice.find({})
      .sort({ over_due: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone");

    for (const invoice of invoices) {
      if (invoice.over_duo < currentDate && invoice.status === "open") {
        await Invoice.updateMany(
          { _id: invoice._id },
          { $set: { status: "overduo" } }
        );
      }

      if (invoice.over_duo < currentDate && invoice.status === "pending") {
        await Invoice.updateMany(
          { _id: invoice._id },
          { $set: { status: "overduo" } }
        );
      }
    }

    // Recupere a lista atualizada de faturas após as atualizações
    const updatedInvoices = await Invoice.find({})
      .sort({ over_due: 1 })
      .select("-__v")
      .populate("user_obj", "client_number first_name last_name email phone");

    res.status(200).json(updatedInvoices);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Rota para atualizar o status das faturas com base nas datas
router.put("/update-invoice-status", async (req, res) => {
  try {
    const currentDate = new Date();

    // Encontre todas as faturas
    const invoices = await Invoice.find({}).sort({ over_due: 1 });

    // Atualize o status para "completed" se a fatura estiver vencida
    for (const invoice of invoices) {
      if (invoice.over_due < currentDate && invoice.status !== "completed") {
        await Invoice.updateOne(
          { _id: invoice._id },
          { $set: { status: "completed" } }
        );
      }
    }

    // Recupere a lista atualizada de faturas após as atualizações
    const updatedInvoices = await Invoice.find({}).sort({ over_due: 1 });

    res.status(200).json(updatedInvoices);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

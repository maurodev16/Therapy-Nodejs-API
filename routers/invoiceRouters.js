const express = require('express');
const router = express.Router();
const cloudinary = require("../services/cloudinaryConfig");
const Invoice = require('../models/invoiceSchema');
const User = require('../models/userSchema');
const uploadSingleInvoice = require('../middleware/multerSingleInvoiceMiddleware')
// Rota para criar uma nova fatura
router.post('/create-invoice', uploadSingleInvoice.single("file"), async (req, res) => {
  try {
    const { userId, invoice_url } = req.body;

   // Verificar se o invoice foi enviado para a galeria
   if (!req.file || req.file.length === 0) {
    return res.status(400).send("No invoice provided");
  }
    // Verifica se o usuário existe
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const file = req.file;
    const public_id = `${user.last_name}-${user._id}-${file.originalname.split(".")[0]}`;
    const result = await cloudinary.uploader.upload(file.path, {
      allowed_formats: ["png", "jpg", "jpeg", "pdf"],
      public_id: public_id,
      overwrite: false,
      upload_preset: "wasGehtAb_preset",
      
    });

    if (!result.secure_url) {
      return res.status(500).send("Error uploading image to cloudinary");
    }

    // Cria a fatura no banco de dados
    const newInvoice = await Invoice.create({
      user: userId,
      invoice_url: cloudinaryUploadResult.secure_url,
    });

    // Atualiza o campo invoice_qnt no modelo de usuário
    user.invoice_qnt += 1;
    user.invoice_obj.push(newInvoice._id); // Adiciona o ID da nova fatura à lista
    await user.save();

    res.status(200).json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

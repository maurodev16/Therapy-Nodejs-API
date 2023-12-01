import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import User from "../models/userSchema.js";

dotenv.config();
const router = express.Router();


// CREATE (C)
router.post("/create", async (req, res) => {
  const userData = req.body;

  try {
    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: userData.email });
    if (emailExists) {
      return res.status(422).json({ error: "EmailAlreadyExistsException" });
    }   // Verifica se o email do User já está em uso
    const phoneExists = await User.findOne({ phone: userData.phone });
    if (phoneExists) {
      return res.status(422).json({ error: "PhoneAlreadyExistsException" });
    }
    const user = new User({
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      user_type: userData.user_type,
    });

    const newCreatedUser = await user.save();
    if (newCreatedUser) {
      user.client_number = newCreatedUser.client_number;
      return res.status(201).json({ newCreatedUser: newCreatedUser });
    }
  } catch (error) {
    console.error(`Erro to create user: ${error}`);
    return res.status(500).json({ error: "ErroSignupOnDatabaseException" });
  }
});

// READ (R)
router.get("/fetch", async (req, res) => {
  ///checkToken,
  try {
    const users = await User.find().sort({ client_number: 1 })
    .select("-__v")
    .select("-password")
   if (!users) {
      return res.status(404).send("UserNotFoundException");
    }
    res.status(200).json({ userdata: users });
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE (U)

router.put("/update/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Verifica se o ID fornecido é um ID válido do MongoDB
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Verifica se o usuário com o ID fornecido existe
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verifica se o e-mail na solicitação é diferente do e-mail atual do usuário
    if (req.body.email && req.body.email !== existingUser.email) {
      // Verifica se o novo e-mail já está em uso por outro usuário
      const emailInUse = await User.findOne({ email: req.body.email });
      if (emailInUse) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    // Atualiza o usuário
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true, // Executa validação de esquema durante a atualização
    });

    res.json({ msg: "User_updated_successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Verifica se o ID fornecido é um ID válido do MongoDB
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Verifica se o usuário com o ID fornecido existe
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Realiza qualquer lógica adicional de verificação antes da exclusão
    // Exemplo: Verificar se o usuário tem permissão para excluir
    // if (!userHasPermissionToDelete(req.user, existingUser)) {
    //   return res.status(403).json({ error: "Permission denied" });
    // }

    // Exclui o usuário
    await User.deleteOne({ _id: userId });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função para verificar se o usuário tem permissão para excluir
// function userHasPermissionToDelete(requestingUser, targetUser) {
//   // Adicione sua lógica de verificação de permissão aqui
//   // Por exemplo, você pode comparar os IDs, verificar se é um administrador, etc.
//   return requestingUser.isAdmin || requestingUser._id === targetUser._id;
// }

export default router;

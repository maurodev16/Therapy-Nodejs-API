require("dotenv").config();
const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/userSchema");

// CREATE (C)
router.post("/create", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(422).json({ error: "EmailAlreadyExistsException" });
    }

    const user = new User({
      first_name:first_name,
      last_name:last_name,
      email:email,
      password:password,
    });

    const newCreatedUser = await user.save();
    if (newCreatedUser) {
      user.user_id = newCreatedUser._id;
      user.client_number = newCreatedUser.client_number;
      return res.status(201).json({ newCreatedUser });
    }
  } catch (error) {
    console.error(`Erro to create user: ${error}`);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

// READ (R)
router.get("/fetch", async (req, res) => {
  ///checkToken,
  try {
    const users = await User.find().select("-password");

    if (!users) {
      return res.status(404).send("UserNotFoundException");
    }

    const userdata = users.map((user) => {
      return {
        user_id: user._id,
        client_number: user.client_number,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
    res.status(200).json({ userdata: userdata });
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

module.exports = router;

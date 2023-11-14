const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String },
    client_number: { type: Number, unique: true },
    first_name: { type: String },
    last_name: { type: String  },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, enum: ['admin', 'client'], default:"client" },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Apenas incrementa o client_number se for um novo documento
  if (!this.isNew) {
    return next();
  }

  // Consulta o último client_number no banco de dados
  const lastClient = await mongoose.model("User", userSchema)
    .findOne({}, { client_number: 1 }, { sort: { client_number: -1 } })
    .lean();

  // Gera um novo client_number incrementando o último obtido
  const newClientNumber = (lastClient?.client_number || 99) + 1;
  this.client_number = newClientNumber;

  // Garante que user_id seja exclusivo e não nulo
  if (!this.user_id) {
    this.user_id = new mongoose.Types.ObjectId();
  }

  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
  }

  next();
});


const User = mongoose.model("User", userSchema);

module.exports = User;

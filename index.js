import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cloudinary from "cloudinary";
cloudinary.v2;
import swaggerUi from "swagger-ui-express";
import swaggerSpec from './swaggerConfig.js';
import userRoutes from "./routers/UserRouters.js";
import loginRoutes from "./routers/LoginRouters.js";
import appointmentRoutes from "./routers/AppontmentRouters.js";
import invoiceRoutes from "./routers/invoiceRouters.js";
import {initializeApp,  applicationDefault } from "firebase-admin/app";
import fs from "fs";
process.env.GOOGLE_APPLICATION_CREDENTIALS;
const app = express();
const PORT = process.env.PORT || 3001;

initializeApp({
  credential: applicationDefault(),
 
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do Swagger
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", loginRoutes);
app.use("/api/v1/appointment", appointmentRoutes);
app.use("/api/v1/invoice", invoiceRoutes);

// Connect to MongoDB
const DB_USER = process.env.DB_USER;
const DB_PASWORD = process.env.DB_PASWORD;
const DB_NAME = process.env.DB_NAME;
const CLUSTER = process.env.CLUSTER;
mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASWORD}${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log("Connected to MongoDB");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

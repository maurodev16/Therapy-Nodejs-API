require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig'); 
const userRoutes = require('./routers/UserRouters');
const loginRoutes = require('./routers/LoginRouters');
const appointmentRoutes = require('./routers/AppontmentRouters');
const invoiceRoutes = require('./routers/invoiceRouters');

const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Configuração do Swagger
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", loginRoutes);
app.use("/api/v1/appointment", appointmentRoutes);
app.use("/api/v1/invoice", invoiceRoutes);


// Connect to MongoDB
const DB_USER = process.env.DB_USER
const DB_PASWORD = process.env.DB_PASWORD
const DB_NAME = process.env.DB_NAME
const CLUSTER = process.env.CLUSTER
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASWORD}${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
       
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
            console.log('Connected to MongoDB');
        });
    })
    .catch((err) =>{
        console.error('Failed to connect to MongoDB', err);
});

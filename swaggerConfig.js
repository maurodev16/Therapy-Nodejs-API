import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Nome da API',
      version: '1.0.0',
      description: 'Descrição da API',
    },
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

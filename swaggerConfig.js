const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0', // Especifique a versão do OpenAPI
    info: {
      title: 'Nome da API',
      version: '1.0.0',
      description: 'Descrição da API',
    },
  },
  apis: ['./index.js'], // Especifique o caminho dos arquivos que contêm as definições de API
};

const specs = swaggerJsdoc(options);

module.exports = specs;

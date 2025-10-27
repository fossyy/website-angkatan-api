import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Arung Gemini API Documentation",
    version: "1.0.0",
    description: "test test test",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server",
    },
    {
      url: "https://staging-angkatan.fossy.my.id",
      description: "Staging Server",
    },
    {
      url: "https://prod-angkatan.fossy.my.id",
      description: "Production Server",
    },
  ],
  tags: [
    {
      name: "Gemini",
      description: "Endpoint untuk integrasi dengan Gemini AI",
    },
    {
      name: "General",
      description: "Endpoint umum",
    },
  ],
};

const options = {
  swaggerDefinition,
  // gemini.js
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

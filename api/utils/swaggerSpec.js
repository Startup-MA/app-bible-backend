import swaggerJsdoc from "swagger-jsdoc"

const swaggerOptions = {
    definition: {
    openapi: "3.0.0",
    info: {
      title: "The Bible API",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.CLUSTER_DOMAIN, // Update this to your local server URL
        description: "Development server",
      },
    ],
  },
  // 2. Point to the files that contain your routes and Swagger comments
  apis: ["./docs/*.yaml"], // Adjust this path to match your project structure
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)

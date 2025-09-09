const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // 👈 important for Render
      },
    },
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connection established successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to PostgreSQL:", error);
  });

module.exports = sequelize;

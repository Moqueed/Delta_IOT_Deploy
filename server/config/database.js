const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432, // default port for Postgres
    dialect: "postgres", // ✅ switched from mysql → postgres
    logging: false,
  }
);

// Check if the connection is established successfully
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connection established successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to the database:", error);
  });

module.exports = sequelize;

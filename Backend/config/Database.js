const { Sequelize } = require("sequelize");
require("dotenv").config();

console.log("DB Password:", process.env.DB_PASSWORD); // Debug xem password có được đọc đúng không

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // Đảm bảo không bị undefined
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Tắt log query
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected!"))
  .catch((err) => console.error("❌ Connection error:", err));

module.exports = sequelize;

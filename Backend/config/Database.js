const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

// Kiểm tra kết nối (tùy chọn)
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to database:", error);
  });

module.exports = sequelize;

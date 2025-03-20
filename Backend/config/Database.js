const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_Password, // Match the case in your .env file
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Add port configuration
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false // You might need this for Supabase
      } : false
    }
  }
);

// Kiểm tra kết nối (tùy chọn)
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to database:", error);
    console.log("DB_USER:", process.env.DB_USER);
    console.log(
      "DB_Password:", // Match the case in your .env file
      process.env.DB_Password ? "Loaded" : "Not Loaded"
    );
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("DB_SSL:", process.env.DB_SSL);
  });

module.exports = sequelize;

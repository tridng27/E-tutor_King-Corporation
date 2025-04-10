const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// Check if we have a DATABASE_URL (for Render deployment)
if (process.env.DATABASE_URL) {
  // Use connection string for production
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      family: 4  // Force IPv4 connections
    }
  });
} else {
  // Use individual parameters for development
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        family: 4  // Force IPv4 connections
      }
    }
  );
}

// Kiểm tra kết nối (tùy chọn)
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
  })
  .catch((error) => {
    console.error("❌ Unable to connect to database:", error);
    
    // Log connection details for debugging
    if (process.env.DATABASE_URL) {
      console.log("Using DATABASE_URL connection string");
    } else {
      console.log("DB_USER:", process.env.DB_USER);
      console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "Loaded" : "Not Loaded");
      console.log("DB_HOST:", process.env.DB_HOST);
      console.log("DB_PORT:", process.env.DB_PORT);
      console.log("DB_NAME:", process.env.DB_NAME);
      console.log("DB_SSL:", process.env.DB_SSL);
    }
  });

module.exports = sequelize;

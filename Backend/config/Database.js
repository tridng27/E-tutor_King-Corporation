const { Sequelize } = require("sequelize");
require("dotenv").config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "*****" : "MISSING");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: process.env.DB_SSL === "true",
        rejectUnauthorized: false,
      },
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => console.error("❌ Connection error:", err));

module.exports = sequelize;

// ✅ Add this to run database.js manually
if (require.main === module) {
  sequelize
    .authenticate()
    .then(() => console.log("✅ Database connection test successful!"))
    .catch((err) => console.error("❌ Connection error:", err))
    .finally(() => sequelize.close());
}

const { DataTypes } = require("sequelize");
const sequelize = require("../config/Database");
const User = require("./user");

const Ticket = sequelize.define("Ticket", {
  TicketID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: User,
      key: "UserID"
    }
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Status: {
    type: DataTypes.ENUM("Open", "Closed", "Pending"),
    allowNull: false,
    defaultValue: "Open"
  },
  TicketDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "Ticket",
  timestamps: false
});

User.hasMany(Ticket, { foreignKey: "UserID" });
Ticket.belongsTo(User, { foreignKey: "UserID" });

module.exports = Ticket;

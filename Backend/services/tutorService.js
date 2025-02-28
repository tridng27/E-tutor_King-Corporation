const Tutor = require("../models/tutorModel");

const getTutorByEmail = async (email) => {
  return await Tutor.findOne({ where: { email } });
};

module.exports = { getTutorByEmail };

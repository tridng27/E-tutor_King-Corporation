const Tutor = require("../models/tutor");

const getTutorByUserId = async (userId) => {
  return await Tutor.findOne({ where: { userid: userId } });
};

const updateTutor = async (tutorId, updateData) => {
  const tutor = await Tutor.findByPk(tutorId);
  if (!tutor) throw new Error("Tutor không tồn tại");
  return await tutor.update(updateData);
};

module.exports = { getTutorByUserId, updateTutor };

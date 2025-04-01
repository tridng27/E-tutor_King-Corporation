// Make sure to import the Timetable model correctly
const db = require('../models');
const Timetable = db.Timetable || require('../models/timetable');
const Class = db.Class || require('../models/class');
const Tutor = db.Tutor || require('../models/tutor');
const User = db.User || require('../models/user');
const { Op } = require('sequelize');

// Log available models for debugging
console.log('Available models in timetableService:', Object.keys(db));
console.log('Timetable model available:', !!Timetable);

const timetableService = {
  // Get all timetables within a date range
  getTimetables: async (startDate, endDate) => {
    if (!Timetable) {
      throw new Error('Timetable model is not available');
    }
    
    return await Timetable.findAll({
      where: {
        TimetableDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Class,
          include: [
            {
              model: Tutor,
              include: [
                {
                  model: User,
                  attributes: ["Name"]
                }
              ]
            }
          ]
        }
      ],
      order: [["TimetableDate", "ASC"], ["TimetableSchedule", "ASC"]]
    });
  },

  // Get a timetable by ID
  getTimetableById: async (id) => {
    return await Timetable.findByPk(id, {
      include: [
        {
          model: Class,
          include: [
            {
              model: Tutor,
              include: [
                {
                  model: User,
                  attributes: ["Name"]
                }
              ]
            }
          ]
        }
      ]
    });
  },

  // Create a new timetable entry
  createTimetable: async (timetableData) => {
    return await Timetable.create(timetableData);
  },

  // Update an existing timetable entry
  updateTimetable: async (id, timetableData) => {
    const timetable = await Timetable.findByPk(id);
    if (!timetable) {
      throw new Error('Timetable not found');
    }
    return await timetable.update(timetableData);
  },

  // Delete a timetable entry
  deleteTimetable: async (id) => {
    const timetable = await Timetable.findByPk(id);
    if (!timetable) {
      throw new Error('Timetable not found');
    }
    return await timetable.destroy();
  },

  // Get timetables for a specific class
  getTimetablesByClass: async (classId, startDate, endDate) => {
    return await Timetable.findAll({
      where: {
        ClassID: classId,
        TimetableDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [["TimetableDate", "ASC"], ["TimetableSchedule", "ASC"]]
    });
  },

  // Get timetables for a specific tutor (via their classes)
  getTimetablesByTutor: async (tutorId, startDate, endDate) => {
    return await Timetable.findAll({
      include: [
        {
          model: Class,
          where: { TutorID: tutorId },
          include: [
            {
              model: Tutor,
              include: [
                {
                  model: User,
                  attributes: ["Name"]
                }
              ]
            }
          ]
        }
      ],
      where: {
        TimetableDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [["TimetableDate", "ASC"], ["TimetableSchedule", "ASC"]]
    });
  }
};

module.exports = timetableService;

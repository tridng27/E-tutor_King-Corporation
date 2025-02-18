const TutorModel = require('../models/tutorModel');

class TutorService {
  static async getAllTutors() {
    return await TutorModel.getAllTutors();
  }

  static async getTutorById(id) {
    return await TutorModel.getTutorById(id);
  }

  static async createTutor(tutor) {
    return await TutorModel.createTutor(tutor);
  }
}

module.exports = TutorService;

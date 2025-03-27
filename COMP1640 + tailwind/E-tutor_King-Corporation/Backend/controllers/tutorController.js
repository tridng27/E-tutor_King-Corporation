const { Tutor } = require("../models");

// Lấy danh sách gia sư (Chỉ admin)
exports.getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutor.findAll();
        res.status(200).json(tutors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tutors", error: error.message });
    }
};

// Thêm gia sư (Chỉ admin)
exports.createTutor = async (req, res) => {
    try {
        const { userId, fix } = req.body;

        // Kiểm tra nếu tutor đã tồn tại
        const existingTutor = await Tutor.findOne({ where: { userId } });
        if (existingTutor) {
            return res.status(400).json({ message: "Tutor already exists" });
        }

        const newTutor = await Tutor.create({ userId, fix });
        res.status(201).json({ message: "Tutor created successfully", tutor: newTutor });
    } catch (error) {
        res.status(500).json({ message: "Creation failed", error: error.message });
    }
};

// Xóa gia sư (Chỉ admin)
exports.deleteTutor = async (req, res) => {
    try {
        const { id } = req.params;

        // Chỉ admin có quyền xóa
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized access!" });
        }

        const tutor = await Tutor.findByPk(id);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        await tutor.destroy();
        res.status(200).json({ message: "Tutor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

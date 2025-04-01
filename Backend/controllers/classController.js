const Class = require("../models/class");
const { sendClassAssignmentNotification } = require('../services/emailService');

// Lấy danh sách tất cả lớp học
const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách lớp học." });
    }
};

// Lấy thông tin lớp học theo ID
const getClassById = async (req, res) => {
    try {
        const classData = await Class.findByPk(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: "Lớp học không tồn tại." });
        }
        res.status(200).json(classData);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy thông tin lớp học." });
    }
};

// Tạo lớp học mới
const createClass = async (req, res) => {
    try {
        const { Name } = req.body;
        const newClass = await Class.create({ Name });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi tạo lớp học." });
    }
};

// Cập nhật thông tin lớp học
const updateClass = async (req, res) => {
    try {
        const { Name } = req.body;
        const classData = await Class.findByPk(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: "Lớp học không tồn tại." });
        }
        await classData.update({ Name });
        res.status(200).json(classData);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật lớp học." });
    }
};

// Xóa lớp học
const deleteClass = async (req, res) => {
    try {
        const classData = await Class.findByPk(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: "Lớp học không tồn tại." });
        }
        await classData.destroy();
        res.status(200).json({ message: "Xóa lớp học thành công." });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa lớp học." });
    }
};

module.exports = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
};

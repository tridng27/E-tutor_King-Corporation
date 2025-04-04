import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

function StudentInformation({ onClose, student, refreshStudents }) {
    const [formData, setFormData] = useState({
        Name: '',
        Email: '',
        Password: '',
        Birthdate: '',
        Gender: 'Male'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (student) {
            setFormData({
                Name: student.Name || '',
                Email: student.Email || '',
                Password: '', // Không hiển thị password cũ
                Birthdate: student.Birthdate ? student.Birthdate.split('T')[0] : '',
                Gender: student.Gender || 'Male'
            });
        }
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Name) newErrors.Name = 'Please enter a name';
        if (!formData.Email) {
            newErrors.Email = 'Please enter email';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.Email)) {
            newErrors.Email = 'Invalid email';
        }
        if (!student && !formData.Password) {
            newErrors.Password = 'Please enter password';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const dataToSend = { ...formData };
            if (student && !dataToSend.Password) delete dataToSend.Password;

            if (student) {
                await apiService.updateStudent(student.UserID, dataToSend);
            } else {
                await apiService.createStudent(dataToSend);
            }
            refreshStudents();
            onClose();
        } catch (error) {
            console.error("Error while storing data:", error);
            alert(error.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {student ? 'Edit student' : 'Add new student'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Tên */}
                    <div>
                        <label className="block mb-1">Name *</label>
                        <input
                            type="text"
                            name="Name"
                            value={formData.Name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.Name && 'border-red-500'}`}
                        />
                        {errors.Name && <p className="text-red-500 text-sm mt-1">{errors.Name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1">Email *</label>
                        <input
                            type="email"
                            name="Email"
                            value={formData.Email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.Email && 'border-red-500'}`}
                            disabled={!!student}
                        />
                        {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}
                    </div>

                    {/* Mật khẩu (chỉ khi thêm mới) */}
                    {!student && (
                        <div>
                            <label className="block mb-1">Password *</label>
                            <input
                                type="password"
                                name="Password"
                                value={formData.Password}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded ${errors.Password && 'border-red-500'}`}
                            />
                            {errors.Password && <p className="text-red-500 text-sm mt-1">{errors.Password}</p>}
                        </div>
                    )}

                    {/* Ngày sinh */}
                    <div>
                        <label className="block mb-1">Date of birth</label>
                        <input
                            type="date"
                            name="Birthdate"
                            value={formData.Birthdate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Giới tính */}
                    <div>
                        <label className="block mb-1">Gender</label>
                        <select
                            name="Gender"
                            value={formData.Gender}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {student ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentInformation;
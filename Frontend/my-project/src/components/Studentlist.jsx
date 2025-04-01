import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const Studentlist = ({ onClose, onConfirm, classId }) => {
    const [studentsNotInClass, setStudentsNotInClass] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentsNotInClass = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiService.getStudentsNotInClass(classId);
                console.log('Students not in class:', response); // Debug log
                setStudentsNotInClass(response);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Không thể tải danh sách học sinh');
            } finally {
                setLoading(false);
            }
        };
        
        if (classId) {
            fetchStudentsNotInClass();
        }
    }, [classId]);

    const toggleSelectStudent = (studentId) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(studentId)
                ? prevSelected.filter(id => id !== studentId)
                : [...prevSelected, studentId]
        );
    };

    // Update the handleConfirm function in Studentlist.jsx
const handleConfirm = async () => {
    if (selectedStudents.length === 0) {
        setError('Vui lòng chọn ít nhất một học sinh');
        return;
    }
    
    try {
        setLoading(true);
        
        // Process each student one by one
        for (const studentId of selectedStudents) {
            await onConfirm(studentId);
        }
        
        // Show success message
        setError(null);
        alert(`${selectedStudents.length} student(s) added successfully! Email notifications have been sent.`);
        
        onClose();
    } catch (error) {
        console.error('Error details:', error.response?.data || error);
        setError(`Lỗi khi thêm học sinh: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">Add student into current class</h2>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="text-center py-4">Fetching all student...</div>
                ) : (
                    <>
                        <div className="max-h-64 overflow-y-auto mb-4">
                            {studentsNotInClass.length > 0 ? (
                                studentsNotInClass.map((student) => {
                                    // Debug log từng student
                                    console.log('Student data:', student);
                                    const studentId = student.StudentID;
                                    console.log('StudentID: ', studentId);
                                    return (
                                        <div 
                                            key={studentId} 
                                            className="flex items-center gap-2 p-2 border-b hover:bg-gray-50"
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStudents.includes(studentId)}
                                                onChange={() => toggleSelectStudent(studentId)}
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{student.Name || student.User?.Name}</p>
                                                <p className="text-sm text-gray-500">
                                                    ID: {studentId} - {student.User?.Email}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No student existing to add into class
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-600">
                                Chosen: {selectedStudents.length} students
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    onClick={handleConfirm}
                                    disabled={selectedStudents.length === 0 || loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Thêm vào lớp'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Studentlist;
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ClassStudentSelector = ({ onClose, onConfirm }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiService.getAllStudents();
                console.log("Fetched students:", response); // Debug log
                setStudents(response);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Could not load student list');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllStudents();
    }, []);

    const toggleSelectStudent = (userId) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(userId)
                ? prevSelected.filter(id => id !== userId)
                : [...prevSelected, userId]
        );
    };

    const handleConfirm = () => {
        if (selectedStudents.length === 0) {
            setError('Please select at least one student');
            return;
        }
        
        onConfirm(selectedStudents);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> 
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Select Students for Class</h2>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="text-center py-4">Loading students...</div>
                ) : (
                    <>
                        <div className="max-h-64 overflow-y-auto mb-4">
                            {students && students.length > 0 ? (
                                students.map((student) => (
                                    <div 
                                        key={student.UserID} 
                                        className="flex items-center gap-2 p-2 border-b hover:bg-gray-50"
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudents.includes(student.UserID)}
                                            onChange={() => toggleSelectStudent(student.UserID)}
                                            className="h-4 w-4"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{student.Name || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500">
                                                ID: {student.UserID} - {student.Email || 'No email'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No students available
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-600">
                                Selected: {selectedStudents.length} students
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    className="px-4 py-2 text-white rounded-md bg-red-500 hover:bg-red-600"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    onClick={handleConfirm}
                                    disabled={selectedStudents.length === 0 || loading}
                                >
                                    Confirm Selection
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassStudentSelector;

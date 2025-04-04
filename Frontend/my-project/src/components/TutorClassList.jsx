import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const TutorClassList = ({ onClose, onConfirm, tutorId }) => {
    const [classesWithoutTutor, setClassesWithoutTutor] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassesWithoutTutor = async () => {
            try {
                setLoading(true);
                setError(null);
                // Get classes that don't have any tutor assigned
                const response = await apiService.getClassesWithoutTutor();
                console.log('Classes without tutor:', response); // Debug log
                setClassesWithoutTutor(response);
            } catch (error) {
                console.error('Error fetching classes:', error);
                setError('Could not load class list');
            } finally {
                setLoading(false);
            }
        };
        
        if (tutorId) {
            fetchClassesWithoutTutor();
        }
    }, [tutorId]);

    const toggleSelectClass = (classId) => {
        setSelectedClasses((prevSelected) =>
            prevSelected.includes(classId)
                ? prevSelected.filter(id => id !== classId)
                : [...prevSelected, classId]
        );
    };

    const handleConfirm = async () => {
        if (selectedClasses.length === 0) {
            setError('Please select at least one class');
            return;
        }
        
        try {
            // Get full info of selected classes for debugging
            const selectedClassesFullInfo = classesWithoutTutor
                .filter(cls => selectedClasses.includes(cls.ClassID));
            
            // Debug logs
            console.log('Selected classes full info:', selectedClassesFullInfo);
            
            // Send the selected class IDs to be assigned to the tutor
            await onConfirm(selectedClasses); 
            
            onClose();
        } catch (error) {
            console.error('Error details:', error.response?.data || error);
            setError(`Error adding classes: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">Assign Classes to Tutor</h2>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="text-center py-4">Fetching available classes...</div>
                ) : (
                    <>
                        <div className="max-h-64 overflow-y-auto mb-4">
                            {classesWithoutTutor.length > 0 ? (
                                classesWithoutTutor.map((cls) => {
                                    const classId = cls.ClassID;
                                    return (
                                        <div 
                                            key={classId} 
                                            className="flex items-center gap-2 p-2 border-b hover:bg-gray-50"
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={selectedClasses.includes(classId)}
                                                onChange={() => toggleSelectClass(classId)}
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{cls.Name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Class ID: {cls.ClassID}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No available classes to assign (all classes have tutors)
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-600">
                                Selected: {selectedClasses.length} classes
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
                                    disabled={selectedClasses.length === 0 || loading}
                                >
                                    {loading ? 'Processing...' : 'Assign Classes'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TutorClassList;
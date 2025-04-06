import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ClassTutorSelector = ({ onClose, onConfirm }) => {
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiService.getAllTutors();
                setTutors(data);
            } catch (err) {
                setError('Failed to load tutors');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTutors();
    }, []);

    const handleTutorSelect = (e) => {
        setSelectedTutor(e.target.value);
    };

    const handleConfirm = () => {
        if (!selectedTutor) {
            setError('Please select a tutor');
            return;
        }
        
        // Find the selected tutor to get their name
        const tutor = tutors.find(t => t.TutorID.toString() === selectedTutor);
        const tutorName = tutor?.User?.Name || `Tutor ID: ${selectedTutor}`;
        
        onConfirm(selectedTutor, tutorName);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Select Tutor for Class</h2>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="text-center py-4">Loading tutors...</div>
                ) : (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Select Tutor</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedTutor}
                                onChange={handleTutorSelect}
                                disabled={loading}
                            >
                                <option value="">-- Select a Tutor --</option>
                                {tutors.map((tutor) => (
                                    <option key={tutor.TutorID} value={tutor.TutorID}>
                                        {tutor.User?.Name || 'Unknown'} (ID: {tutor.TutorID})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                disabled={!selectedTutor || loading}
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassTutorSelector;

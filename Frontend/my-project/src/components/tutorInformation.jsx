import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const TutorInformation = ({ onClose, tutor, refreshTutors, classId }) => {
    // Mode can be 'edit' (editing tutor info) or 'assign' (assigning tutor to class)
    const mode = classId ? 'assign' : 'edit';
    
    const [formData, setFormData] = useState({
        Name: '',
        Email: '',
        Gender: '',
        Birthdate: '',
        Specialization: '',
        Description: ''
    });
    
    const [tutors, setTutors] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(tutor?.TutorID || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch all tutors if in assign mode
    useEffect(() => {
        if (mode === 'assign') {
            const fetchTutors = async () => {
                try {
                    setLoading(true);
                    const data = await apiService.getAllTutors();
                    setTutors(data);
                    setLoading(false);
                } catch (err) {
                    setError('Failed to load tutors');
                    console.error(err);
                    setLoading(false);
                }
            };
            fetchTutors();
        }
    }, [mode]);

    // Set form data if editing a tutor
    useEffect(() => {
        if (tutor && mode === 'edit') {
            setFormData({
                Name: tutor.User?.Name || '',
                Email: tutor.User?.Email || '',
                Gender: tutor.User?.Gender || '',
                Birthdate: tutor.User?.Birthdate ? new Date(tutor.User.Birthdate).toISOString().split('T')[0] : '',
                Specialization: tutor.Fix || '',
                Description: tutor.Description || ''
            });
        }
    }, [tutor, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTutorSelect = (e) => {
        setSelectedTutor(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            if (mode === 'edit') {
                // Edit tutor information
                if (!tutor) {
                    throw new Error("No tutor selected");
                }
                await apiService.updateTutor(tutor.TutorID, formData);
                if (refreshTutors) refreshTutors();
                onClose();
            } else {
                // Assign tutor to class
                if (!selectedTutor) {
                    setError('Please select a tutor');
                    setLoading(false);
                    return;
                }

                // If there's already a tutor assigned, remove them first
                if (tutor && tutor.TutorID) {
                    await apiService.removeTutorFromClass(classId, tutor.TutorID);
                }
                
                // Assign the new tutor
                await apiService.assignTutorToClass(classId, selectedTutor);
                
                setSuccessMessage('Tutor assigned successfully! An email notification has been sent.');
                
                // Refresh the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error("Error:", error);
            setError(error.message || (mode === 'edit' ? "Failed to update tutor information" : "Failed to assign tutor"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
                {mode === 'edit' 
                    ? (tutor ? 'Edit Tutor' : 'Add New Tutor')
                    : (tutor ? 'Change Tutor Assignment' : 'Assign Tutor to Class')}
            </h2>
            
            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm">
                    {successMessage}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                {mode === 'edit' ? (
                    // Edit Tutor Form
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                name="Name"
                                value={formData.Name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="Email"
                                value={formData.Email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <select
                                name="Gender"
                                value={formData.Gender}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Birth Date</label>
                            <input
                                type="date"
                                name="Birthdate"
                                value={formData.Birthdate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Specialization</label>
                            <input
                                type="text"
                                name="Specialization"
                                value={formData.Specialization}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                name="Description"
                                value={formData.Description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded h-24"
                            ></textarea>
                        </div>
                    </>
                ) : (
                    // Assign Tutor Form
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Select Tutor</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedTutor}
                            onChange={handleTutorSelect}
                            disabled={loading}
                        >
                            <option value="">-- Select a Tutor --</option>
                            {tutors.map((t) => (
                                <option key={t.TutorID} value={t.TutorID}>
                                    {t.User?.Name || 'Unknown'} (ID: {t.TutorID})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
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
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (mode === 'edit' ? 'Save Changes' : 'Assign Tutor')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TutorInformation;

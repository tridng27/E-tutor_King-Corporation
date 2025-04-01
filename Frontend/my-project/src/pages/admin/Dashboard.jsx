import { useEffect, useState } from "react";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import apiService from "../../services/apiService";
import StudentInformation from '../../components/studentInformation';
import TutorInformation from '../../components/tutorInformation';
import TutorClassList from '../../components/TutorClassList';

function Dashboard() {
    const [showStudentInfo, setShowStudentInfo] = useState(false);
    const [showTutorInfo, setShowTutorInfo] = useState(false);
    const [showTutorClassList, setShowTutorClassList] = useState(false);
    const [students, setStudents] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [currentTutor, setCurrentTutor] = useState(null);
    const [tutorClasses, setTutorClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
        fetchTutors();
    }, []);

    // Add monitoring for tutors array
    useEffect(() => {
        console.log("Tutors array updated:", tutors);
        console.log("Tutor IDs:", tutors.map(t => t.TutorID));
    }, [tutors]);

    // Add monitoring for currentTutor
    useEffect(() => {
        console.log("Current tutor updated:", currentTutor);
    }, [currentTutor]);

    const fetchStudents = async () => {
        try {
            const data = await apiService.getAllStudents();
            if (data) setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchTutors = async () => {
        try {
            const data = await apiService.getAllTutors();
            console.log("API response for tutors:", data);
            
            if (data && Array.isArray(data)) {
                setTutors(data);
                
                // Only set current tutor if we have tutors and none is currently selected
                if (data.length > 0 && !currentTutor) {
                    console.log("Setting initial tutor:", data[0]);
                    setCurrentTutor(data[0]);
                    fetchTutorClasses(data[0].TutorID);
                }
            } else {
                console.error("Invalid tutor data format:", data);
            }
        } catch (error) {
            console.error("Error fetching tutors:", error);
        }
    };

    const fetchTutorClasses = async (tutorId) => {
        try {
            console.log("Fetching classes for tutor ID:", tutorId);
            const data = await apiService.getClassesByTutor(tutorId);
            console.log("Classes for tutor:", data);
            if (data) setTutorClasses(data);
        } catch (error) {
            console.error("Error fetching tutor classes:", error);
        }
    };

    const filteredStudents = students.filter(student =>
        student.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.Email && student.Email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (UserID) => {
        try {
            await apiService.deleteStudent(UserID);
            fetchStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setShowStudentInfo(true);
    };

    const handleEditTutor = (tutor) => {
        setCurrentTutor(tutor);
        setShowTutorInfo(true);
    };

    const handleTutorChange = (e) => {
        const selectedIdString = e.target.value;
        const selectedId = parseInt(selectedIdString, 10);
        
        console.log("Selected tutor ID:", selectedId);
        console.log("Available tutors:", tutors.map(t => t.TutorID));
        
        // Find the tutor with the matching ID
        const selected = tutors.find(t => Number(t.TutorID) === selectedId);
        
        if (selected) {
            console.log("Found tutor:", selected);
            // Create a new object to ensure state update
            const tutorToSet = {...selected};
            console.log("Setting current tutor to:", tutorToSet);
            setCurrentTutor(tutorToSet);
            fetchTutorClasses(selected.TutorID);
        } else {
            console.error("Could not find tutor with ID:", selectedId);
            // Fallback: try to find by string comparison
            const fallbackTutor = tutors.find(t => String(t.TutorID) === selectedIdString);
            if (fallbackTutor) {
                console.log("Found tutor using string comparison:", fallbackTutor);
                setCurrentTutor({...fallbackTutor});
                fetchTutorClasses(fallbackTutor.TutorID);
            }
        }
    };

    const handleAssignClasses = async (classIds) => {
        try {
            // Process each class ID and assign to the current tutor
            for (const classId of classIds) {
                await apiService.assignTutorToClass(classId, currentTutor.TutorID);
            }
            // Refresh the tutor's classes
            fetchTutorClasses(currentTutor.TutorID);
            return true;
        } catch (error) {
            console.error("Error assigning classes to tutor:", error);
            throw error;
        }
    };

    const handleRemoveTutorFromClass = async (classId) => {
        try {
            if (confirm('Are you sure you want to remove this tutor from the class?')) {
                await apiService.removeTutorFromClass(classId, currentTutor.TutorID);
                // Refresh the tutor's classes
                fetchTutorClasses(currentTutor.TutorID);
            }
        } catch (error) {
            console.error("Error removing tutor from class:", error);
        }
    };

    return (
        <div className="relative">
            <div className="flex h-full">
                <Sidebar/>
               
                <div className="flex-1 p-6 ml-16">
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 mb-4 border rounded-lg p-2 shadow-sm">
                        <input
                            type="text"
                            placeholder="Search by name"
                            className="flex-1 p-2 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="text-gray-500 cursor-pointer" />
                        <Plus
                            className="text-gray-500 cursor-pointer"
                            onClick={() => {
                                setEditingStudent(null);
                                setShowStudentInfo(true);
                            }}
                        />
                    </div>

                    {/* Students List */}
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <div key={student.UserID} className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white mb-3">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex flex-row text-sm gap-4 w-full justify-between">
                                        <p><span className="font-medium">Name:</span> {student.Name}</p>
                                        <p><span className="font-medium">Email:</span> {student.Email || 'N/A'}</p>
                                        <p><span className="font-medium">Birth date:</span> {new Date(student.Birthdate).toLocaleDateString('vi-VN')} </p>
                                        <p><span className="font-medium">Gender:</span> {student.Gender}</p>
                                    </div>
                                    <div className="flex gap-2">
                                    <button
                                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition"
                                        onClick={() => handleEdit(student)}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                                        onClick={() => handleDelete(student.UserID)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No students found</p>
                    )}

                    {/* Tutor Infographic (Enhanced) */}
                    <div className="flex flex-col items-center justify-center min-h-screen p-4">
                        {/* Tutor Selector */}
                        <div className="w-full max-w-xl mb-4">
                            <select
                                className="w-full p-2 border rounded-lg"
                                onChange={handleTutorChange}
                                value={currentTutor?.TutorID || ''}
                            >
                                <option value="" disabled>Select a tutor</option>
                                {tutors.map(tutor => (
                                    <option key={tutor.TutorID} value={tutor.TutorID}>
                                        {tutor.User?.Name || `Tutor ID: ${tutor.TutorID}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Use key to force re-render when tutor changes */}
                        <div key={`tutor-info-${currentTutor?.TutorID || 'none'}`} className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl border relative">
                            <h2 className="text-lg font-semibold text-center mb-4">Tutor Infographic</h2>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="font-semibold">Name: <span className="font-normal">{currentTutor?.User?.Name || '________'}</span></p>
                                    <p className="font-semibold">ID: <span className="font-normal">{currentTutor?.TutorID || '________'}</span></p>
                                    <p className="font-semibold">Email: <span className="font-normal">{currentTutor?.User?.Email || '________'}</span></p>
                                    <p className="font-semibold">Specialization: <span className="font-normal">{currentTutor?.Fix || '________'}</span></p>
                                    <p className="font-semibold">Description:</p>
                                    <p className="text-sm text-gray-600">{currentTutor?.Description || 'No description available'}</p>
                                   
                                    {/* Current Classes Section */}
                                    <div className="mt-4">
                                        <p className="font-semibold">Current Classes:</p>
                                        {tutorClasses.length > 0 ? (
                                            <ul className="list-disc pl-5 mt-2">
                                                {tutorClasses.map(cls => (
                                                    <li key={cls.ClassID} className="text-sm flex justify-between items-center py-1">
                                                        <span>
                                                            {cls.Name} - ID: {cls.ClassID}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveTutorFromClass(cls.ClassID)}
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                            title="Remove from class"
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">No classes assigned</p>
                                        )}
                                    </div>
                                </div>
                                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                                    {currentTutor?.User?.Avatar ? (
                                        <img
                                            src={currentTutor.User.Avatar}
                                            alt="Tutor Avatar"
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16 text-gray-700">
                                            <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-8 16c0-3.314 3.582-6 8-6s8 2.686 8 6v2H4v-2Z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700"
                                onClick={() => handleEditTutor(currentTutor)}
                                disabled={!currentTutor}
                            >
                                Edit Tutor
                            </button>
                            <button
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                                onClick={() => setShowTutorClassList(true)}
                                disabled={!currentTutor}
                            >
                                Assign Classes
                            </button>
                        </div>
                    </div>
                </div>

                <RightSidebar/>
            </div>

            {showStudentInfo && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <StudentInformation
                        onClose={() => {
                            setShowStudentInfo(false);
                            setEditingStudent(null);
                        }}
                        student={editingStudent}
                        refreshStudents={fetchStudents}
                    />
                </div>
            )}

            {showTutorInfo && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <TutorInformation
                                                onClose={() => setShowTutorInfo(false)}
                                                tutor={currentTutor}
                                                refreshTutors={() => {
                                                    fetchTutors();
                                                    if (currentTutor) {
                                                        fetchTutorClasses(currentTutor.TutorID);
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                        
                                    {showTutorClassList && currentTutor && (
                                        <TutorClassList
                                            onClose={() => setShowTutorClassList(false)}
                                            onConfirm={handleAssignClasses}
                                            tutorId={currentTutor.TutorID}
                                        />
                                    )}
                                </div>
                            );
                        }
                        
                        export default Dashboard;
                        

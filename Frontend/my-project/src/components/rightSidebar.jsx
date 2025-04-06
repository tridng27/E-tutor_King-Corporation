import { useEffect, useState, useContext } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import ClassInformation from "./classInformation";
import { GlobalContext } from "../context/GlobalContext";

function RightSidebar() {
    const { user, setCurrentTutor, fetchTutorClasses } = useContext(GlobalContext);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingClass, setEditingClass] = useState(null);
    const [showClassForm, setShowClassForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await apiService.get("/classes");
            setClasses(response.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const handleDeleteClass = async (ClassID) => {
        try {
            await apiService.delete(`/classes/${ClassID}`);
            fetchClasses();
        } catch (error) {
            console.error("Error deleting class:", error);
        }
    };

    // Modify the handleAddClass function in RightSidebar.jsx
const handleAddClass = async (newClass) => {
    try {
        // Check if the class already has a ClassID (meaning it was already created)
        if (newClass.ClassID) {
            console.log("Class already created, just updating the UI", newClass);
            // Just update the UI without making another API call
            setClasses(prevClasses => [...prevClasses, newClass]);
        } else {
            // Only create a new class if it doesn't have an ID yet
            console.log("Creating new class via API", newClass);
            const response = await apiService.post("/classes", newClass);
            setClasses(prevClasses => [...prevClasses, response.data]);
        }
        setShowClassForm(false);
    } catch (error) {
        console.error("Error adding class:", error);
    }
};

    const handleUpdateClass = async (updatedClass) => {
        try {
            await apiService.put(`/classes/${updatedClass.ClassID}`, updatedClass);
            fetchClasses();
            setEditingClass(null);
        } catch (error) {
            console.error("Error updating class:", error);
        }
    };

    // Updated handleClassClick to fetch and set tutor information
    const handleClassClick = async (classId) => {
        try {
            // Fetch class details including tutor information
            const classDetails = await apiService.get(`/classes/${classId}`);
            console.log("Class details:", classDetails.data);
            
            // If the class has a tutor, fetch the tutor details and set current tutor
            if (classDetails.data && classDetails.data.TutorID) {
                try {
                    // Use the correct API method for fetching tutor details
                    const tutorDetails = await apiService.getTutorById(classDetails.data.TutorID);
                    console.log("Tutor details:", tutorDetails);
                    
                    if (tutorDetails) {
                        setCurrentTutor(tutorDetails);
                        fetchTutorClasses(tutorDetails.TutorID);
                    }
                } catch (tutorError) {
                    console.error("Error fetching tutor details:", tutorError);
                }
            } else {
                console.log("Class has no tutor assigned");
                setCurrentTutor(null);
            }
            
            // Navigate to the class page
            navigate(`/class/${classId}`);
        } catch (error) {
            console.error("Error fetching class details:", error);
        }
    };

    return (
        <div className="w-1/5 bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Classes</h3>
                {user?.Role === "Admin" && (
                    <button 
                        onClick={() => { setShowClassForm(true); setEditingClass(null); }} 
                        className="text-blue-500 text-lg"
                    >
                        <FaPlus />
                    </button>
                )}
            </div>

            <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
            />

            <div className="mt-4 space-y-3">
                {classes
                    .filter((classItem) => 
                        classItem.Name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((classItem) => (
                        <div 
                            key={classItem.ClassID} 
                            className="flex justify-between items-center p-2 bg-white shadow rounded-lg cursor-pointer" 
                            onClick={() => handleClassClick(classItem.ClassID)}
                        >
                            <p className="font-bold text-sm">{classItem.Name}</p>
                            {user?.Role === "Admin" && (
                                <div>
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setEditingClass(classItem); 
                                            setShowClassForm(true); 
                                        }}
                                        className="text-yellow-500 text-lg mr-2"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleDeleteClass(classItem.ClassID); 
                                        }}
                                        className="text-red-500 text-lg"
                                    >
                                        ✖
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            {showClassForm && (
                <ClassInformation 
                    onClose={() => { setShowClassForm(false); setEditingClass(null); }} 
                    onAddClass={handleAddClass} 
                    onUpdateClass={handleUpdateClass}
                    editingClass={editingClass}
                />
            )}
        </div>
    );
}

export default RightSidebar;

import { useEffect, useState, useContext } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import ClassInformation from "./classInformation";
import { GlobalContext } from "../context/GlobalContext";

function RightSidebar() {
    const { user } = useContext(GlobalContext);
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

    const handleAddClass = async (newClass) => {
        try {
            const response = await apiService.post("/classes", newClass);
            setClasses([...classes, response.data]);
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

    // Hàm xử lý khi click vào một lớp
    const handleClassClick = async (classId) => {
        try {
          navigate(`/class/${classId}`, { 
          });
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
                            onClick={() => handleClassClick(classItem.ClassID)} // Sửa lại ở đây
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
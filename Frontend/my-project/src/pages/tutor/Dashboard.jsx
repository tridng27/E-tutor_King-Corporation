import { useState, useEffect, useContext } from "react";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";
import { GlobalContext } from "../../context/GlobalContext";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function Dashboard() {
    const { currentTutor, user } = useContext(GlobalContext);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentSubjects, setStudentSubjects] = useState({});

    // Fetch tutor's classes on component mount
    useEffect(() => {
        const fetchTutorClasses = async () => {
            try {
                setLoading(true);
                const response = await apiService.get('/tutor/classes');
                setClasses(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
                toast.error("Failed to load your classes");
                setLoading(false);
            }
        };

        if (user) {
            fetchTutorClasses();
        }
    }, [user]);

    // Fetch students when a class is selected
    const handleClassSelect = async (classId) => {
        try {
            setLoading(true);
            setSelectedClass(classId);
            const response = await apiService.get(`/tutor/classes/${classId}/students`);
            setStudents(response.data);
            
            // Fetch subjects for each student
            const subjectsPromises = response.data.map(student => 
                apiService.get(`/studentsubjects/students/${student.StudentID}/subjects`)
                    .then(res => ({ studentId: student.StudentID, subjects: res.data }))
            );
            
            const subjectsResults = await Promise.all(subjectsPromises);
            
            // Create a map of studentId -> subjects
            const subjectsMap = {};
            subjectsResults.forEach(result => {
                subjectsMap[result.studentId] = result.subjects;
            });
            
            setStudentSubjects(subjectsMap);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
            setLoading(false);
        }
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student => 
        student.User?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.StudentID).includes(searchTerm)
    );

    // Handle editing student scores and attendance
    const handleEdit = (student) => {
        setEditingStudent({
            ...student,
            subjects: studentSubjects[student.StudentID] || []
        });
    };

    // Handle saving changes
    const handleSave = async () => {
        try {
            setLoading(true);
            
            // For each modified subject, send update request
            const updatePromises = editingStudent.subjects.map(subject => 
                apiService.put(`/studentsubjects/${subject.StudentSubjectID}`, {
                    Score: subject.Score,
                    Attendance: subject.Attendance
                })
            );
            
            await Promise.all(updatePromises);
            
            // Update the local state
            const updatedSubjects = { ...studentSubjects };
            updatedSubjects[editingStudent.StudentID] = editingStudent.subjects;
            setStudentSubjects(updatedSubjects);
            
            setEditingStudent(null);
            setLoading(false);
            toast.success("Student records updated successfully");
        } catch (error) {
            console.error("Error updating student records:", error);
            toast.error("Failed to update student records");
            setLoading(false);
        }
    };

    // Handle cancel editing
    const handleCancel = () => {
        setEditingStudent(null);
    };

    // Handle input change for editing
    const handleInputChange = (subjectIndex, field, value) => {
        const updatedSubjects = [...editingStudent.subjects];
        updatedSubjects[subjectIndex][field] = value;
        
        setEditingStudent({
            ...editingStudent,
            subjects: updatedSubjects
        });
    };

    return (
        <div className="relative">
            <div className="flex h-screen">
                <Sidebar />

                {/* Main content */}
                <div className="flex-1 p-6 ml-16 transition-all duration-300 overflow-y-auto">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h1 className="text-2xl font-bold mb-4">Tutor Dashboard</h1>
                        
                        {/* Tutor information */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h2 className="text-lg font-semibold mb-2">Your Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p><span className="font-medium">Name:</span> {user?.Name || "N/A"}</p>
                                    <p><span className="font-medium">Email:</span> {user?.Email || "N/A"}</p>
                                </div>
                                <div>
                                    <p><span className="font-medium">Tutor ID:</span> {currentTutor?.TutorID || "N/A"}</p>
                                    <p><span className="font-medium">Subject:</span> {currentTutor?.Fix || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Class selection */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-2">Your Classes</h2>
                            <div className="flex flex-wrap gap-2">
                                {loading && classes.length === 0 ? (
                                    <p>Loading classes...</p>
                                ) : classes.length === 0 ? (
                                    <p>You are not assigned to any classes yet.</p>
                                ) : (
                                    classes.map(cls => (
                                        <button
                                            key={cls.ClassID}
                                            onClick={() => handleClassSelect(cls.ClassID)}
                                            className={`px-4 py-2 rounded-md ${
                                                selectedClass === cls.ClassID
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 hover:bg-gray-300"
                                            }`}
                                        >
                                            {cls.ClassName}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        {/* Search bar */}
                        {selectedClass && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-semibold">Student List</h2>
                                    <Link 
                                        to={`/class/${selectedClass}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Class Details
                                    </Link>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search students by name or ID" 
                                    className="w-full p-2 border rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Student list */}
                    {selectedClass && (
                        <div className="mt-6 bg-white p-6 rounded-lg shadow">
                            {loading ? (
                                <p>Loading students...</p>
                            ) : filteredStudents.length === 0 ? (
                                <p>No students found in this class.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="p-2">Student ID</th>
                                                <th className="p-2">Name</th>
                                                <th className="p-2">Subjects</th>
                                                <th className="p-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(student => (
                                                <tr key={student.StudentID} className="border-b hover:bg-gray-50">
                                                    <td className="p-2">{student.StudentID}</td>
                                                    <td className="p-2">{student.User?.Name}</td>
                                                    <td className="p-2">
                                                        {studentSubjects[student.StudentID]?.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {studentSubjects[student.StudentID].map(subject => (
                                                                    <div key={subject.StudentSubjectID} className="text-sm">
                                                                        <span className="font-medium">{subject.Subject?.SubjectName || 'Unknown Subject'}</span>: 
                                                                        <span className={`ml-1 ${
                                                                            subject.Score >= 70 ? "text-green-600" : 
                                                                            subject.Score >= 50 ? "text-yellow-600" : 
                                                                            subject.Score ? "text-red-600" : ""
                                                                        }`}>
                                                                            Score: {subject.Score !== null ? subject.Score : "N/A"}
                                                                        </span>, 
                                                                        <span className={`ml-1 ${
                                                                            subject.Attendance >= 80 ? "text-green-600" : 
                                                                            subject.Attendance >= 60 ? "text-yellow-600" : 
                                                                            subject.Attendance ? "text-red-600" : ""
                                                                        }`}>
                                                                            Attendance: {subject.Attendance !== null ? `${subject.Attendance}%` : "N/A"}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">No subjects assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        <button 
                                                            onClick={() => handleEdit(student)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            disabled={loading || !studentSubjects[student.StudentID]?.length}
                                                        >
                                                            Manage Scores
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Edit student modal */}
                    {editingStudent && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
                                <h2 className="text-xl font-bold mb-4">
                                    Manage Scores for {editingStudent.User?.Name} (ID: {editingStudent.StudentID})
                                </h2>
                                
                                {editingStudent.subjects?.length > 0 ? (
                                    <div className="mb-4">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="p-2 text-left">Subject</th>
                                                    <th className="p-2 text-left">Score (0-100)</th>
                                                    <th className="p-2 text-left">Attendance (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {editingStudent.subjects.map((subject, idx) => (
                                                    <tr key={subject.StudentSubjectID} className="border-b">
                                                        <td className="p-2">{subject.Subject?.SubjectName || 'Unknown Subject'}</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={subject.Score || ""}
                                                                onChange={(e) => handleInputChange(idx, "Score", e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={subject.Attendance || ""}
                                                                onChange={(e) => handleInputChange(idx, "Attendance", e.target.value)}
                                                                className="w-full p-2 border rounded"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="mb-4">No subjects assigned to this student.</p>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right sidebar */}
                <RightSidebar />
            </div>
        </div>
    );
}

export default Dashboard;

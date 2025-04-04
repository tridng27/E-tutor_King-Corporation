import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/sidebar';
import { useParams } from 'react-router-dom';
import RightSidebar from '../components/rightSidebar';
import { Search, Plus } from 'lucide-react';
import Studentlist from '../components/Studentlist'; 
import TutorInformation from '../components/tutorInformation';
import apiService from '../services/apiService';
import { GlobalContext } from "../context/GlobalContext";

function Class() {
    const { currentTutor } = useContext(GlobalContext);
    const [showStudentInfo, setShowStudentInfo] = useState(false);
    const [deletingIds, setDeletingIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTutorInfo, setShowTutorInfo] = useState(false);
    const [students, setStudents] = useState([]);
    const { classId } = useParams();

    // Log for debugging
    useEffect(() => {
        console.log("Class component - currentTutor:", currentTutor);
    }, [currentTutor]);

    useEffect(() => {
      if (classId) { // Thêm điều kiện kiểm tra classId
          fetchStudents();
      }
    }, [classId]); // Thêm classId vào dependency array

    const fetchStudents = async () => {
        try {
            const data = await apiService.getStudentsByClass(classId);
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        }
    };

    const handleAddStudent = async (studentId) => {
        try {
            await apiService.assignStudentToClass(classId, studentId);
            fetchStudents();
            setShowStudentInfo(false);
        } catch (error) {
            console.error("Error adding student", error);
        }
    };

    const filteredStudents = students.filter(student => {
      const studentName = student.User?.Name?.toLowerCase() || '';
      return studentName.includes(searchTerm.toLowerCase());
    });

    const handleRemoveStudent = async (studentId) => {
      try {
        setDeletingIds(prev => [...prev, studentId]);
          // 1. Xác nhận từ người dùng
          const isConfirmed = window.confirm(
              `Bạn có chắc muốn xóa học sinh ${studentId} khỏi lớp học?`
          );
          
          if (!isConfirmed) return;
  
          // 2. Gọi API xóa
          await apiService.removeStudentFromClass(classId, studentId);
  
          // 3. Cập nhật UI ngay lập tức (Optimistic Update)
          setStudents(prev => prev.filter(student => student.StudentID !== studentId));
  
          // 4. Thông báo thành công
          alert(`Đã xóa học sinh ${studentId} thành công!`);
          
      } catch (error) {
          console.error("Error details:", {
              status: error.response?.status,
              message: error.response?.data?.message || error.message
          });
          
          // 5. Khôi phục danh sách nếu có lỗi
          fetchStudents();
          
          alert(`Xóa thất bại: ${error.response?.data?.message || error.message}`);
      } finally {
        setDeletingIds(prev => prev.filter(id => id !== studentId));
      }
    };

    return (
      <div className="relative">
        <div className="flex h-full ">
            <Sidebar/>
            
            <div className="flex-1 p-6 ml-16">
                <div className="flex items-center justify-end mb-6">
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        onClick={() => setShowStudentInfo(true)} 
                    >
                        <Plus size={18} />
                        <span>Add New Student</span>
                    </button>
                </div>

            {/* Search Bar */}
                <div className="flex items-center gap-2 mb-4 border rounded-lg p-2 shadow-sm">
                <input 
                    type="text" 
                    placeholder="Search Students by name" 
                    className="flex-1 p-2 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="text-gray-500" />
            </div>

              {/* Student List */}
              <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-200 text-gray-700 text-left">
                        <th className="p-3 border">Name</th>
                        <th className="p-3 border">Student code</th>
                        <th className="p-3 border">Date of birth</th>
                        <th className="p-3 border">Gender</th>
                        <th className="p-3 border text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                    <tr key={student.UserID} className="hover:bg-gray-100 transition">
                        <td className="p-3 border">{student.User.Name}</td>
                        <td className="p-3 border">{student.StudentID}</td>
                        <td className="p-3 border">{new Date(student.User.Birthdate).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3 border">{student.User.Gender}</td>
                        <td className="p-3 border text-center">
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => handleRemoveStudent(student.StudentID)}
                                    className={`px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition
                                        ${deletingIds.includes(student.StudentID) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={deletingIds.includes(student.StudentID)}
                                >
                                    {deletingIds.includes(student.StudentID) ? 'Đang xóa...' : 'Delete'}
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            {searchTerm ? 
                                `No students found matching "${searchTerm}"` : 
                                'No students in this class'
                            }
                        </div>
                    )}
                </tbody>
              </table>
                    
              {/* Tutor Infographic - Updated to use currentTutor from context */}
              <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl border relative">
                    <h2 className="text-lg font-semibold text-center mb-4">Tutor Infographic</h2>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="font-semibold">Name: <span className="font-normal">{currentTutor?.User?.Name || "________"}</span></p>
                            <p className="font-semibold">ID: <span className="font-normal">{currentTutor?.TutorID || "________"}</span></p>
                            <p className="font-semibold">Subject: <span className="font-normal">{currentTutor?.Fix || "________"}</span></p>
                            <p className="font-semibold">Email: <span className="font-normal">{currentTutor?.User?.Email || "________"}</span></p>
                            <p className="font-semibold">Description:</p>
                            {currentTutor ? (
                                <p className="text-sm text-gray-600">{currentTutor.Description || "No description available"}</p>
                            ) : (
                                <>
                                    <div className="border-b w-64"></div>
                                    <div className="border-b w-64"></div>
                                    <div className="border-b w-64"></div>
                                </>
                            )}
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
                <button 
                    className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700"
                    onClick={() => setShowTutorInfo(true)}
                >
                    {currentTutor ? "Edit Tutor" : "Assign Tutor"}
                </button>
              </div>

            </div>

            <RightSidebar/>
        </div>

        {showStudentInfo && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <Studentlist 
            onClose={() => setShowStudentInfo(false)} 
            onConfirm={handleAddStudent}
            classId={classId} // Truyền classId vào đây
            />
          </div>
        )}

        {showTutorInfo && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <TutorInformation 
                onClose={() => setShowTutorInfo(false)} 
                tutor={currentTutor}
                classId={classId}
            />
          </div>
        )}
      </div>
    );
}

export default Class;

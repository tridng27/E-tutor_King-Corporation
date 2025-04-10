import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/sidebar';
import { useParams } from 'react-router-dom';
import RightSidebar from '../components/rightSidebar';
import { Search, Plus, Trash2 } from 'lucide-react';
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
    const { userRole } = useContext(GlobalContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Log for debugging
    useEffect(() => {
        console.log("Class component - currentTutor:", currentTutor);
    }, [currentTutor]);

    useEffect(() => {
        if (classId) {
            fetchStudents();
        }
    }, [classId]);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.getStudentsByClass(classId);
            setStudents(data);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch students", error);
            setError('Failed to load students. Please try again later.');
        } finally {
            setIsLoading(false);
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

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    const handleRemoveStudent = async (studentId) => {
        try {
            setDeletingIds(prev => [...prev, studentId]);
            
            // 1. Confirm from user
            const isConfirmed = window.confirm(
                `Are you sure you want to delete student ${studentId} from the class?`
            );
            
            if (!isConfirmed) return;
            
            // 2. Call API to delete
            await apiService.removeStudentFromClass(classId, studentId);
            
            // 3. Update UI immediately (Optimistic Update)
            setStudents(prev => prev.filter(student => student.StudentID !== studentId));
            
            // 4. Success notification
            alert(`Student ${studentId} deleted successfully!`);
            
        } catch (error) {
            console.error("Error details:", {
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
            
            // 5. Restore list if there's an error
            fetchStudents();
            
            alert(`Delete fail: ${error.response?.data?.message || error.message}`);
        } finally {
            setDeletingIds(prev => prev.filter(id => id !== studentId));
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar/>
            
            <div className="flex-1 p-4 md:p-6 ml-16 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Class Management</h1>
                        {userRole === 'Admin' && (
                            <button 
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 bg-opacity-20 text-green-700 border border-green-600 rounded-lg hover:bg-opacity-30 transition-colors"
                                onClick={() => setShowStudentInfo(true)}
                            >
                                <Plus size={18} />
                                <span>Add New Student</span>
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tutor Infographic - Only show for admin users */}
                            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
                                <h2 className="text-lg font-semibold text-center mb-4">Tutor Information</h2>
                                
                                <div className="bg-white border rounded-lg p-4 md:p-6 w-full max-w-xl mx-auto relative">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between">
                                        <div className="space-y-2 mb-4 md:mb-0 md:flex-1">
                                            <p className="font-semibold">Name: <span className="font-normal">{currentTutor?.User?.Name || '________'}</span></p>
                                            <p className="font-semibold">ID: <span className="font-normal">{currentTutor?.TutorID || '________'}</span></p>
                                            <p className="font-semibold">Subject: <span className="font-normal">{currentTutor?.Fix || '________'}</span></p>
                                            <p className="font-semibold">Email: <span className="font-normal">{currentTutor?.User?.Email || '________'}</span></p>
                                            <p className="font-semibold">Description:</p>
                                            <p className="text-sm text-gray-600">{currentTutor?.Description || 'No description available'}</p>
                                        </div>
                                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto md:mx-0">
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
                                
                                {/* Only show the Edit Tutor button for admin users */}
                                {userRole === 'Admin' && (
                                    <div className="flex gap-2 mt-4 justify-center">
                                        <button
                                            className="px-6 py-2 bg-blue-600 bg-opacity-20 text-blue-700 border border-blue-600 rounded-lg shadow-sm hover:bg-opacity-30 transition-colors"
                                            onClick={() => setShowTutorInfo(true)}
                                        >
                                            {currentTutor ? "Edit Tutor" : "Assign Tutor"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Search Bar */}
                            <div className="flex items-center gap-2 mb-4 border rounded-lg p-2 shadow-sm bg-white">
                                <Search className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search students by name"
                                    className="flex-1 p-2 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Students List - Desktop View */}
                            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-800 text-white text-left">
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Student ID</th>
                                            <th className="p-3">Birth Date</th>
                                            <th className="p-3">Gender</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length > 0 ? (
                                            currentStudents.map((student) => (
                                                <tr key={student.UserID} className="hover:bg-gray-100 transition border-b">
                                                    <td className="p-3">{student.User.Name}</td>
                                                    <td className="p-3">{student.StudentID}</td>
                                                    <td className="p-3">{new Date(student.User.Birthdate).toLocaleDateString('vi-VN')}</td>
                                                    <td className="p-3">{student.User.Gender}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleRemoveStudent(student.StudentID)}
                                                                className={`p-2 bg-red-500 bg-opacity-20 text-red-700 border border-red-500 rounded-md transition hover:bg-opacity-30 ${
                                                                    deletingIds.includes(student.StudentID) ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                                disabled={deletingIds.includes(student.StudentID)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center p-4 text-gray-500">
                                                    {searchTerm
                                                        ? `No students found matching "${searchTerm}"`
                                                        : 'No students in this class'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Students List - Mobile View */}
                            <div className="md:hidden space-y-4">
                                {filteredStudents.length > 0 ? (
                                    currentStudents.map((student) => (
                                        <div key={student.UserID} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{student.User.Name}</h3>
                                                    <p className="text-gray-600 text-sm">ID: {student.StudentID}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleRemoveStudent(student.StudentID)}
                                                        className={`p-1.5 bg-red-500 bg-opacity-20 text-red-700 border border-red-500 rounded-md transition hover:bg-opacity-30 ${
                                                            deletingIds.includes(student.StudentID) ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                        disabled={deletingIds.includes(student.StudentID)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Birth Date:</span>
                                                    <p>{new Date(student.User.Birthdate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Gender:</span>
                                                    <p>{student.User.Gender}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-4 bg-white rounded-lg shadow text-gray-500">
                                        {searchTerm
                                            ? `No students found matching "${searchTerm}"`
                                            : 'No students in this class'}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-4 px-2 bg-white rounded-lg shadow-sm p-3">
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex flex-row">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 mx-1 bg-gray-200 bg-opacity-50 border border-gray-300 rounded disabled:opacity-50 flex items-center w-[100px] justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span className="hidden sm:inline">Previous</span>
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 mx-1 bg-gray-200 bg-opacity-50 border border-gray-300 rounded disabled:opacity-50 flex items-center w-[100px] justify-center"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <RightSidebar />

            {/* Modals */}
            {showStudentInfo && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <Studentlist
                            onClose={() => setShowStudentInfo(false)}
                            onConfirm={handleAddStudent}
                            classId={classId}
                        />
                    </div>
                </div>
            )}

            {showTutorInfo && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <TutorInformation
                            onClose={() => setShowTutorInfo(false)}
                            tutor={currentTutor}
                            classId={classId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Class;

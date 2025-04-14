import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';

function AssignSubjectForm({ studentId, onClose, onSuccess }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [actualStudentID, setActualStudentID] = useState(null);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // First, get the actual StudentID from the UserID
      const studentResponse = await apiService.get(`/students/${studentId}`);
      const studentData = studentResponse.data;
      
      // Store the actual StudentID
      if (studentData && studentData.StudentID) {
        setActualStudentID(studentData.StudentID);
        
        // Now fetch subjects for this StudentID
        const studentSubjectsResponse = await apiService.get(`/studentsubjects/students/${studentData.StudentID}/subjects`);
        setStudentSubjects(studentSubjectsResponse.data);
      } else {
        console.error('Could not find StudentID for UserID:', studentId);
        toast.error('Could not find student record');
      }
      
      // Fetch all available subjects
      const subjectsResponse = await apiService.get('/subjects');
      setSubjects(subjectsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subjects');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (!actualStudentID) {
      toast.error('Could not determine StudentID');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/studentsubjects', {
        StudentID: actualStudentID, // Use the actual StudentID, not the UserID
        SubjectID: selectedSubject
      });
      
      toast.success('Subject assigned successfully');
      if (onSuccess) onSuccess();
      fetchData(); // Refresh the data
      setSelectedSubject('');
    } catch (error) {
      console.error('Error assigning subject:', error);
      toast.error(error.response?.data?.message || 'Failed to assign subject');
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (studentSubjectId) => {
    if (!window.confirm('Are you sure you want to remove this subject?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.delete(`/studentsubjects/${studentSubjectId}`);
      toast.success('Subject removed successfully');
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error removing subject:', error);
      toast.error(error.response?.data?.message || 'Failed to remove subject');
      setLoading(false);
    }
  };

  // Filter out subjects that are already assigned to the student
  const availableSubjects = subjects.filter(subject => 
    !studentSubjects.some(ss => ss.SubjectID === subject.SubjectID)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">  
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Assign Subject to Student</h2>
        
        {/* Current subjects */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Current Subjects:</h3>
          {loading ? (
            <p>Loading...</p>
          ) : studentSubjects.length === 0 ? (
            <p className="text-gray-500">No subjects assigned yet</p>
          ) : (
            <ul className="space-y-2">
              {studentSubjects.map(ss => (
                <li key={ss.StudentSubjectID} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{ss.Subject?.SubjectName}</span>
                  <button
                    onClick={() => handleRemoveSubject(ss.StudentSubjectID)}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Assign new subject form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Subject:</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={loading || availableSubjects.length === 0}
            >
              <option value="">-- Select a subject --</option>
              {availableSubjects.map(subject => (
                <option key={subject.SubjectID} value={subject.SubjectID}>
                  {subject.SubjectName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !selectedSubject || !actualStudentID}
            >
              Assign Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignSubjectForm;

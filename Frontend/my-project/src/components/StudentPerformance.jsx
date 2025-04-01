import React from 'react';

const StudentPerformance = ({ studentSubjects }) => {
  if (!studentSubjects || studentSubjects.length === 0) {
    return <p className="text-gray-500">No subject data available</p>;
  }

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attendance
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {studentSubjects.map((subject) => (
            <tr key={subject.StudentSubjectID}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {subject.Subject?.SubjectName || 'Unknown Subject'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm ${
                  subject.Score >= 70 ? 'text-green-600' : 
                  subject.Score >= 50 ? 'text-yellow-600' : 
                  subject.Score ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {subject.Score !== null ? subject.Score : 'Not graded'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm ${
                  subject.Attendance >= 80 ? 'text-green-600' : 
                  subject.Attendance >= 60 ? 'text-yellow-600' : 
                  subject.Attendance ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {subject.Attendance !== null ? `${subject.Attendance}%` : 'Not recorded'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  subject.Score >= 70 && subject.Attendance >= 80 ? 'bg-green-100 text-green-800' : 
                  subject.Score >= 50 && subject.Attendance >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {subject.Score >= 70 && subject.Attendance >= 80 ? 'Good' : 
                   subject.Score >= 50 && subject.Attendance >= 60 ? 'Average' : 
                   'Needs Improvement'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentPerformance;

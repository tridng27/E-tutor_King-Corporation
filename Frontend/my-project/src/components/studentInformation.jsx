import React from 'react';

function StudentInformation({ onClose }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-11 rounded-2xl shadow-lg w-[500px] h-[500px] relative">
        <h2 className="text-xl font-semibold text-center mb-4">Add Student</h2>
        <button 
          className="absolute top-2 right-2 text-red-500 text-lg" 
          onClick={onClose}
        >
          ✖
        </button>
        <form>
          <div className="mb-3">
            <label className="block text-sm font-medium">Student Code</label>
            <input type="text" value="GCH210123" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Student Name</label>
            <input type="text" value="Nguyen Van A" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Birth Date</label>
            <input type="text" value="27/06/2003" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Gender</label>
            <select className="w-full p-2 border rounded-md">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button type="button" className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentInformation;

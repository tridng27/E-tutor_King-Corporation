import React from 'react';

function TutorInformation({ onClose }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-11 rounded-2xl shadow-lg w-[500px] h-[550px] relative">
        <h2 className="text-xl font-semibold text-center mb-4">Tutor Infographic</h2>
        <button 
          className="absolute top-2 right-2 text-red-500 text-lg" 
          onClick={onClose}
        >
          ✖
        </button>
        <form>
          <div className="mb-3">
            <label className="block text-sm font-medium">Name</label>
            <input type="text" value="" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">ID</label>
            <input type="text" value="" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Subject</label>
            <input type="text" value="" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Enroll Date</label>
            <input type="text" value="" className="w-full p-2 border rounded-md bg-gray-100" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Description</label>
            <input type="text" value="" className="w-full p-2 border rounded-md bg-gray-100" />
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

export default TutorInformation;

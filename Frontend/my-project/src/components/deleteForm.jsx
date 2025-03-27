import React from 'react';

function DeleteConfirmation({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
        <h2 className="text-xl font-semibold text-center mb-4 text-red-600">Confirm Deletion</h2>
        <p className="text-center text-gray-700 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
        
        <div className="flex justify-between">
          <button 
            className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmation;

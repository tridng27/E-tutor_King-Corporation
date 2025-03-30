import { useState, useEffect } from "react";

function ClassInformation({ onClose, onAddClass, onUpdateClass, editingClass }) {
    const [className, setClassName] = useState("");

    useEffect(() => {
        if (editingClass) {
            setClassName(editingClass.Name.trim());
        } else {
            setClassName("");
        }
    }, [editingClass]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (className.trim() === "") return;

        if (editingClass) {
            // Chỉnh sửa lớp học
            onUpdateClass({ ...editingClass, Name: className });
        } else {
            // Thêm lớp học mới
            const newClass = {
                ClassID: Math.random().toString(36).substr(2, 9), // Fake ID
                Name: className,
            };
            onAddClass(newClass);
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-11 rounded-2xl shadow-lg w-[500px] h-[500px] relative">
                <h2 className="text-xl font-semibold text-center mb-4">
                    {editingClass ? "EDIT CLASS" : "ADD CLASS"}
                </h2>
                <button 
                    className="absolute top-2 right-2 text-red-500 text-lg" 
                    onClick={onClose}
                >
                    ✖
                </button>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium">Class Name</label>
                        <input 
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-100"
                            required
                        />
                    </div>

                    <div className="flex justify-between">
                        <button type="button" className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white" onClick={onClose}>Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white">
                            {editingClass ? "Update" : "Confirm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClassInformation;

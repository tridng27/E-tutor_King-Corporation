import { useState, useEffect } from "react";
import ClassStudentSelector from "./ClassStudentSelector";
import ClassTutorSelector from "./ClassTutorSelector";
import apiService from "../services/apiService";
import axios from "axios";

function ClassInformation({ onClose, onAddClass, onUpdateClass, editingClass }) {
    const [className, setClassName] = useState("");
    const [showStudentSelector, setShowStudentSelector] = useState(false);
    const [showTutorSelector, setShowTutorSelector] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [selectedTutorName, setSelectedTutorName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state to track form submission

    useEffect(() => {
        if (editingClass) {
            setClassName(editingClass.Name.trim());
        } else {
            setClassName("");
            setSelectedStudents([]);
            setSelectedTutor(null);
            setSelectedTutorName("");
        }
    }, [editingClass]);

    // Handle student selection from the selector component
    const handleStudentSelection = (studentIds) => {
        setSelectedStudents(studentIds);
    };

    // Handle tutor selection from the selector component
    const handleTutorSelection = (tutorId, tutorName) => {
        setSelectedTutor(tutorId);
        setSelectedTutorName(tutorName);
    };

    // Remove a student from the selected list
    const removeStudent = (studentId) => {
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted - starting class creation process");
        
        // Prevent duplicate submissions
        if (isSubmitting) {
            console.log("Form already being submitted, preventing duplicate submission");
            return;
        }
        
        setError("");
        
        if (className.trim() === "") {
            setError("Class name is required");
            console.log("Validation failed: Class name is empty");
            return;
        }

        if (!selectedTutor && !editingClass) {
            setError("A tutor must be assigned to the class");
            console.log("Validation failed: No tutor selected");
            return;
        }

        if (selectedStudents.length === 0 && !editingClass) {
            setError("At least one student must be added to the class");
            console.log("Validation failed: No students selected");
            return;
        }

        console.log("Validation passed, proceeding with class creation");
        console.log("Class data:", { name: className, tutor: selectedTutor, students: selectedStudents });
        
        setLoading(true);
        setIsSubmitting(true); // Mark form as being submitted
        
        try {
            if (editingClass) {
                // Update existing class
                console.log("Updating existing class:", editingClass.ClassID);
                await onUpdateClass({ ...editingClass, Name: className });
                console.log("Class updated successfully");
                onClose();
            } else {
                // Create new class
                const newClass = {
                    Name: className,
                };
                
                console.log("Step 1: Creating class with data:", newClass);
                
                // Step 1: Create the class
                const response = await apiService.createClass(newClass);
                console.log("Class creation raw response:", response);
                
                // Extract the actual data from the Axios response
                const classResponse = response.data;
                console.log("Class data from response:", classResponse);
                
                // Check for different possible property names for the class ID
                const classId = classResponse?.ClassID || classResponse?.classID || classResponse?.classId || classResponse?.id;
                console.log("Extracted class ID:", classId);
                
                if (!classId) {
                    console.error("Failed to extract class ID from response");
                    throw new Error("Failed to create class - no class ID returned");
                }
                
                console.log("Created class with ID:", classId);
                
                // Step 2: Assign tutor to class
                if (selectedTutor) {
                    try {
                        console.log(`Step 2: Assigning tutor ${selectedTutor} to class ${classId}`);
                        const tutorResponse = await apiService.assignTutorToClass(classId, selectedTutor);
                        console.log("Tutor assignment response:", tutorResponse);
                        console.log("Tutor assigned successfully");
                    } catch (tutorError) {
                        console.error("Error assigning tutor:", tutorError);
                        console.error("Error details:", tutorError.response?.data || tutorError.message);
                        setError(`Class created but failed to assign tutor: ${tutorError.message}`);
                    }
                }
                
                // Step 3: Add students to class
                let successCount = 0;
                let failedStudents = [];
                
                console.log(`Step 3: Adding ${selectedStudents.length} students to class ${classId}`);
                
                for (const studentId of selectedStudents) {
                    try {
                        console.log(`Adding student ${studentId} to class ${classId}`);
                        // Use assignStudentToClass instead of addStudentToClass
                        const studentResponse = await apiService.assignStudentToClass(classId, studentId);
                        console.log(`Student ${studentId} addition response:`, studentResponse);
                        console.log(`Student ${studentId} added successfully`);
                        successCount++;
                    } catch (studentError) {
                        console.error(`Error adding student ${studentId}:`, studentError);
                        console.error("Error details:", studentError.response?.data || studentError.message);
                        failedStudents.push(studentId);
                    }
                }
                
                // Step 4: Notify about results
                if (failedStudents.length > 0) {
                    console.log(`Class created with ${successCount} students. Failed to add students: ${failedStudents.join(', ')}`);
                    setError(`Class created with ${successCount} students. Failed to add students: ${failedStudents.join(', ')}`);
                } else {
                    console.log(`Successfully created class with ${successCount} students`);
                }
                
                // Notify parent component about the new class
                if (onAddClass) {
                    console.log("Notifying parent component about new class");
                    // Pass the class with ID to the parent component
                    onAddClass({
                        ClassID: classId,
                        Name: className,
                        TutorID: selectedTutor
                    });
                }
                
                // Close the dialog only if we were able to create the class
                console.log("Closing dialog");
                onClose();
            }
        } catch (error) {
            console.error("Error saving class:", error);
            console.error("Error stack:", error.stack);
            console.error("Error response data:", error.response?.data);
            setError("Failed to save class: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
            setIsSubmitting(false); // Reset submission state
            console.log("Class creation process completed");
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto relative">
                <h2 className="text-xl font-semibold text-center mb-4">
                    {editingClass ? "EDIT CLASS" : "ADD CLASS"}
                </h2>
                <button 
                    className="absolute top-4 right-4 text-red-500 text-lg" 
                    onClick={onClose}
                    disabled={isSubmitting} // Disable close button during submission
                >
                    ✖
                </button>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Class Name</label>
                        <input 
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-50"
                            required
                            disabled={isSubmitting} // Disable input during submission
                        />
                    </div>

                    {!editingClass && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Assigned Tutor</label>
                                {selectedTutor ? (
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded border">
                                        <span>{selectedTutorName || `Tutor ID: ${selectedTutor}`}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setShowTutorSelector(true)}
                                            className="text-blue-500 text-sm"
                                            disabled={isSubmitting} // Disable button during submission
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowTutorSelector(true)}
                                        className="w-full p-2 border rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        disabled={isSubmitting} // Disable button during submission
                                    >
                                        Assign Tutor
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Students ({selectedStudents.length})</label>
                                <div className="border rounded-md p-2 bg-gray-50 mb-2 max-h-32 overflow-y-auto">
                                    {selectedStudents.length > 0 ? (
                                        <ul>
                                            {selectedStudents.map(id => (
                                                <li key={id} className="text-sm py-1 flex justify-between items-center">
                                                    <span>Student ID: {id}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeStudent(id)}
                                                        className="text-red-500 text-xs"
                                                        disabled={isSubmitting} // Disable button during submission
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No students added yet</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowStudentSelector(true)}
                                    className="w-full p-2 border rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    disabled={isSubmitting} // Disable button during submission
                                >
                                    {selectedStudents.length > 0 ? "Add More Students" : "Add Students"}
                                </button>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between mt-4">
                        <button 
                            type="button" 
                            className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white" 
                            onClick={onClose}
                            disabled={loading || isSubmitting} // Disable button during submission
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                            disabled={loading || isSubmitting} // Disable button during submission
                        >
                            {loading ? "Processing..." : (editingClass ? "Update" : "Create Class")}
                        </button>
                    </div>
                </form>

                {showStudentSelector && !isSubmitting && (
                    <ClassStudentSelector 
                        onClose={() => setShowStudentSelector(false)}
                        onConfirm={handleStudentSelection}
                    />
                )}

                {showTutorSelector && !isSubmitting && (
                    <ClassTutorSelector 
                        onClose={() => setShowTutorSelector(false)}
                        onConfirm={handleTutorSelection}
                    />
                )}
            </div>
        </div>
    );
}

export default ClassInformation;

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import RightSidebar from '../../components/rightSidebar';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { useGlobal } from '../../context/GlobalContext';
import apiService from '../../services/apiService';

function Timetable() {
    const [timetables, setTimetables] = useState([]);
    const [classes, setClasses] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [timetableData, setTimetableData] = useState({
        ClassID: '',
        TimetableDate: '',
        TimetableLocation: '',
        TimetableSchedule: ''
    });
    
    // Use the global context to access authentication state
    const { user, hasRole } = useGlobal();
    const isAdmin = hasRole('Admin');
    
    // Time slots definition
    const timeSlots = [
        { id: 1, name: 'Slot 1', time: '8:00 - 9:30' },
        { id: 2, name: 'Slot 2', time: '9:45 - 11:15' },
        { id: 3, name: 'Slot 3', time: '13:00 - 14:30' },
        { id: 4, name: 'Slot 4', time: '14:45 - 16:15' },
        { id: 5, name: 'Slot 5', time: '16:30 - 18:00' }
    ];

    // Generate array of days for the current week
    const getDaysOfWeek = (date) => {
        const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
        const days = [];
        
        for (let i = 0; i < 7; i++) {
            const day = addDays(startDate, i);
            days.push({
                date: day,
                formattedDate: format(day, 'yyyy-MM-dd'),
                dayName: format(day, 'EEE'),
                fullDate: format(day, 'MMM dd, yyyy')
            });
        }
        
        return days;
    };
    
    const daysOfWeek = getDaysOfWeek(currentWeek);
    
    // Navigate between weeks
    const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
    const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
    const goToCurrentWeek = () => setCurrentWeek(new Date());
    
    // Fetch timetables and classes data from backend
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const startDate = format(daysOfWeek[0].date, 'yyyy-MM-dd');
                const endDate = format(daysOfWeek[6].date, 'yyyy-MM-dd');
                
                // Fetch timetables for the selected week using the new method
                const timetablesData = await apiService.getAllTimetables(startDate, endDate);
                
                // Fetch all classes for the dropdown
                const classesData = await apiService.getAllClasses();
                
                setTimetables(timetablesData);
                setClasses(classesData);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load timetable. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [currentWeek]);
    
    // Find timetable entry for a specific day and time slot
    const getTimetableForSlot = (dayDate, timeSlot) => {
        // Convert timeSlot.time to a date object for comparison
        const getTimeFromSlot = (slotTime) => {
            const [startTime] = slotTime.split(' - ');
            const [hours, minutes] = startTime.split(':').map(Number);
            return new Date(0, 0, 0, hours, minutes);
        };
        
        return timetables.find(timetable => {
            const timetableDate = format(new Date(timetable.TimetableDate), 'yyyy-MM-dd');
            const timetableTime = new Date(timetable.TimetableSchedule);
            const slotTime = getTimeFromSlot(timeSlot.time);
            
            // Compare date and approximate time (within 30 minutes)
            return timetableDate === dayDate && 
                   Math.abs(timetableTime.getHours() - slotTime.getHours()) < 1 &&
                   Math.abs(timetableTime.getMinutes() - slotTime.getMinutes()) < 30;
        });
    };
    
       // Get class details for a timetable entry
       const getClassDetails = (classId) => {
        return classes.find(cls => cls.ClassID === classId);
    };
    
    // Handle slot click for admin
    const handleSlotClick = (day, slot) => {
        if (!isAdmin) return;
        
        const timetable = getTimetableForSlot(day.formattedDate, slot);
        const timetableTime = `${day.formattedDate}T${slot.time.split(' - ')[0]}:00`;
        
        setSelectedSlot({ day, slot });
        setTimetableData({
            ClassID: timetable?.ClassID || '',
            TimetableDate: day.formattedDate,
            TimetableLocation: timetable?.TimetableLocation || 'Online',
            TimetableSchedule: timetable?.TimetableSchedule || timetableTime
        });
        setShowModal(true);
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const timetable = getTimetableForSlot(selectedSlot.day.formattedDate, selectedSlot.slot);
            
            if (timetable) {
                // Update existing timetable entry using the new method
                await apiService.updateTimetable(timetable.TimetableID, timetableData);
            } else {
                // Create new timetable entry using the new method
                await apiService.createTimetable(timetableData);
            }
            
            // Refresh timetables data
            const startDate = format(daysOfWeek[0].date, 'yyyy-MM-dd');
            const endDate = format(daysOfWeek[6].date, 'yyyy-MM-dd');
            const updatedTimetables = await apiService.getAllTimetables(startDate, endDate);
            
            setTimetables(updatedTimetables);
            setShowModal(false);
        } catch (err) {
            console.error('Error saving timetable:', err);
            alert('Failed to save timetable. Please try again.');
        }
    };
    
    // Handle timetable entry deletion
    const handleDelete = async () => {
        try {
            const timetable = getTimetableForSlot(selectedSlot.day.formattedDate, selectedSlot.slot);
            
            if (timetable) {
                // Delete timetable entry using the new method
                await apiService.deleteTimetable(timetable.TimetableID);
                
                // Refresh timetables data
                const startDate = format(daysOfWeek[0].date, 'yyyy-MM-dd');
                const endDate = format(daysOfWeek[6].date, 'yyyy-MM-dd');
                const updatedTimetables = await apiService.getAllTimetables(startDate, endDate);
                
                setTimetables(updatedTimetables);
            }
            
            setShowModal(false);
        } catch (err) {
            console.error('Error deleting timetable:', err);
            alert('Failed to delete timetable. Please try again.');
        }
    };

    return (
        <div className="flex h-screen">
                <Sidebar />

                {/* Main content */}
                <div className="flex-1 p-6 ml-16 overflow-y-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-4">Class Schedule</h1>
                        
                        {/* Week navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={goToPreviousWeek}
                                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    &lt; Previous Week
                                </button>
                                <button 
                                    onClick={goToCurrentWeek}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Current Week
                                </button>
                                <button 
                                    onClick={goToNextWeek}
                                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Next Week &gt;
                                </button>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    {format(daysOfWeek[0].date, 'MMM dd')} - {format(daysOfWeek[6].date, 'MMM dd, yyyy')}
                                </span>
                            </div>
                        </div>

                        {/* Week selector dropdown */}
                        <div className="mb-4">
                            <label htmlFor="weekSelect" className="mr-2">Jump to week:</label>
                            <input 
                                type="week" 
                                id="weekSelect" 
                                className="border rounded px-2 py-1"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [year, week] = e.target.value.split('-W');
                                        const date = new Date(year, 0, 1 + (week - 1) * 7);
                                        setCurrentWeek(date);
                                    }
                                }}
                            />
                        </div>

                        {isLoading ? (
                            <div className="text-center py-4">Loading schedule...</div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-4">{error}</div>
                        ) : (
                            <table className="table-auto border-collapse border border-gray-300 w-full text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 px-4 py-2 w-24">Time</th>
                                        {daysOfWeek.map(day => (
                                            <th key={day.formattedDate} className="border border-gray-300 px-4 py-2">
                                                <div className="font-bold">{day.dayName}</div>
                                                <div className="text-sm">{day.fullDate}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map(slot => (
                                        <tr key={slot.id}>
                                            <th className="border border-gray-300 bg-gray-100 px-4 py-2">
                                                <div className="font-bold">{slot.name}</div>
                                                <div className="text-sm">{slot.time}</div>
                                            </th>
                                            {daysOfWeek.map(day => {
                                                const timetable = getTimetableForSlot(day.formattedDate, slot);
                                                const classDetails = timetable ? getClassDetails(timetable.ClassID) : null;
                                                
                                                return (
                                                    <td 
                                                        key={`${day.formattedDate}-${slot.id}`} 
                                                        className={`border border-gray-300 px-4 py-2 ${isAdmin ? 'cursor-pointer hover:bg-gray-50' : ''} ${timetable ? 'bg-blue-50' : ''}`}
                                                        onClick={() => handleSlotClick(day, slot)}
                                                    >
                                                        {timetable && classDetails ? (
                                                            <div>
                                                                <div className="font-semibold">{classDetails.Name}</div>
                                                                <div className="text-sm text-gray-600">{timetable.TimetableLocation}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {format(new Date(timetable.TimetableSchedule), 'h:mm a')}
                                                                </div>
                                                            </div>
                                                        ) : isAdmin ? (
                                                            <div className="text-gray-400 text-sm text-center">Click to add class</div>
                                                        ) : null}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <RightSidebar />

            {/* Modal for adding/editing timetable entries (admin only) */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {getTimetableForSlot(selectedSlot?.day.formattedDate, selectedSlot?.slot) ? 'Edit Schedule' : 'Add New Schedule'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Day: {selectedSlot?.day.fullDate}</label>
                                <label className="block text-gray-700 mb-2">Time: {selectedSlot?.slot.time}</label>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="class">
                                    Class
                                </label>
                                <select
                                    id="class"
                                    className="w-full border rounded px-3 py-2"
                                    value={timetableData.ClassID}
                                    onChange={(e) => setTimetableData({...timetableData, ClassID: e.target.value})}
                                    required
                                >
                                    <option value="">Select a class</option>
                                    {classes.map(cls => (
                                        <option key={cls.ClassID} value={cls.ClassID}>
                                            {cls.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="location">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    className="w-full border rounded px-3 py-2"
                                    value={timetableData.TimetableLocation}
                                    onChange={(e) => setTimetableData({...timetableData, TimetableLocation: e.target.value})}
                                    placeholder="e.g., Room 101, Online, etc."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="schedule">
                                    Exact Time
                                </label>
                                <input
                                    type="datetime-local"
                                    id="schedule"
                                    className="w-full border rounded px-3 py-2"
                                    value={timetableData.TimetableSchedule}
                                    onChange={(e) => setTimetableData({...timetableData, TimetableSchedule: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                {getTimetableForSlot(selectedSlot?.day.formattedDate, selectedSlot?.slot) && (
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Timetable;


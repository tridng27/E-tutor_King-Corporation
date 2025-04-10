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
    // For mobile view, track which day is selected
    const [selectedDay, setSelectedDay] = useState(0);
    
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
        
        // Fix: Ensure hours have leading zeros
        const timeStr = slot.time.split(' - ')[0];
        const [hours, minutes] = timeStr.split(':');
        const formattedHours = hours.padStart(2, '0');
        const timetableTime = `${day.formattedDate}T${formattedHours}:${minutes}:00`;
        
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

    // Render the desktop view (full week table)
    const renderDesktopView = () => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hidden md:block">
            <div className="w-full overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                Time
                            </th>
                            {daysOfWeek.map(day => (
                                <th key={day.formattedDate} className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">
                                    <div className="font-bold">{day.dayName}</div>
                                    <div className="text-xs font-normal text-gray-300">{day.fullDate}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {timeSlots.map((slot, slotIndex) => (
                            <tr key={slot.id} className={slotIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100">
                                    <div className="font-bold">{slot.name}</div>
                                    <div className="text-xs text-gray-500 font-normal">{slot.time}</div>
                                </th>
                                {daysOfWeek.map(day => {
                                    const timetable = getTimetableForSlot(day.formattedDate, slot);
                                    const classDetails = timetable ? getClassDetails(timetable.ClassID) : null;
                                    
                                    return (
                                        <td
                                            key={`${day.formattedDate}-${slot.id}`}
                                            className={`px-4 py-3 text-sm ${isAdmin ? 'cursor-pointer' : ''}`}
                                            onClick={() => handleSlotClick(day, slot)}
                                        >
                                            {timetable && classDetails ? (
                                                <div className="p-2 bg-blue-50 border-l-4 border-blue-500 rounded-md transition-all hover:shadow-md">
                                                    <div className="font-semibold text-blue-800">{classDetails.Name}</div>
                                                    <div className="flex items-center mt-1 text-xs text-gray-600">
                                                        <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        {timetable.TimetableLocation}
                                                    </div>
                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                        <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        {format(new Date(timetable.TimetableSchedule), 'h:mm a')}
                                                    </div>
                                                </div>
                                            ) : isAdmin ? (
                                                <div className="h-full flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-md text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-all">
                                                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs">Add class</span>
                                                </div>
                                            ) : null}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render the mobile view (single day at a time)
    const renderMobileView = () => {
        const selectedDayData = daysOfWeek[selectedDay];
        
        return (
            <div className="md:hidden">
                {/* Day selector for mobile */}
                <div className="flex justify-between items-center mb-4 bg-white rounded-lg shadow-sm p-2">
                    <button 
                        onClick={() => setSelectedDay(prev => Math.max(0, prev - 1))}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                        disabled={selectedDay === 0}
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    <div className="text-center">
                        <div className="font-bold text-gray-800">{selectedDayData.dayName}</div>
                        <div className="text-sm text-gray-600">{selectedDayData.fullDate}</div>
                    </div>
                    
                    <button 
                        onClick={() => setSelectedDay(prev => Math.min(6, prev + 1))}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                        disabled={selectedDay === 6}
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                {/* Day pills for quick navigation */}
                <div className="flex overflow-x-auto pb-2 mb-4 space-x-1">
                    {daysOfWeek.map((day, index) => (
                        <button
                            key={day.formattedDate}
                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                                selectedDay === index 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setSelectedDay(index)}
                        >
                            {day.dayName}
                        </button>
                    ))}
                </div>
                
                {/* Single day schedule */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3">
                        <h3 className="text-sm font-medium text-white">Schedule for {selectedDayData.fullDate}</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                        {timeSlots.map((slot) => {
                            const timetable = getTimetableForSlot(selectedDayData.formattedDate, slot);
                            const classDetails = timetable ? getClassDetails(timetable.ClassID) : null;
                            
                            return (
                                <div 
                                    key={slot.id} 
                                    className={`p-4 ${isAdmin ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleSlotClick(selectedDayData, slot)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-gray-700">{slot.name}</div>
                                            <div className="text-xs text-gray-500">{slot.time}</div>
                                        </div>
                                        
                                        {isAdmin && !timetable && (
                                            <button className="p-1 bg-gray-100 rounded-full text-gray-500">
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    {timetable && classDetails ? (
                                        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                                            <div className="font-semibold text-blue-800">{classDetails.Name}</div>
                                            <div className="flex items-center mt-2 text-xs text-gray-600">
                                                <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                {timetable.TimetableLocation}
                                            </div>
                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                {format(new Date(timetable.TimetableSchedule), 'h:mm a')}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 border border-dashed border-gray-300 rounded-md text-gray-400 text-center">
                                            {isAdmin ? "Tap to add class" : "No class scheduled"}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main content */}
            <div className="flex-1 p-4 md:p-6 ml-16 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Class Schedule</h1>
                    
                    {/* Week navigation */}
                    <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2 bg-white p-3 md:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousWeek}
                                className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                &lt; Prev
                            </button>
                            <button
                                onClick={goToCurrentWeek}
                                className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-600 bg-opacity-20 text-blue-700 border border-blue-600 rounded-md shadow-sm hover:bg-opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Today
                            </button>
                            <button
                                onClick={goToNextWeek}
                                className="px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Next &gt;
                            </button>
                        </div>
                        <div className="px-3 py-1 md:px-4 md:py-2 bg-blue-50 rounded-md border border-blue-100">
                            <span className="text-xs md:text-sm font-semibold text-blue-800">
                                {format(daysOfWeek[0].date, 'MMM dd')} - {format(daysOfWeek[6].date, 'MMM dd, yyyy')}
                            </span>
                        </div>
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
                            {/* Desktop view (full week table) */}
                            {renderDesktopView()}
                            
                            {/* Mobile view (single day at a time) */}
                            {renderMobileView()}
                        </>
                    )}
                </div>
            </div>
            
            <RightSidebar />
            
            {/* Modal for adding/editing timetable entries (admin only) */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {getTimetableForSlot(selectedSlot?.day.formattedDate, selectedSlot?.slot) ? 'Edit Schedule' : 'Add New Schedule'}
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center text-blue-800">
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{selectedSlot?.day.fullDate}</span>
                                </div>
                                <div className="flex items-center mt-2 text-blue-800">
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{selectedSlot?.slot.time}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="class">
                                        Class
                                    </label>
                                    <select
                                        id="class"
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="location"
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={timetableData.TimetableLocation}
                                            onChange={(e) => setTimetableData({...timetableData, TimetableLocation: e.target.value})}
                                            placeholder="e.g., Room 101, Online, etc."
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="schedule">
                                        Exact Time
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            id="schedule"
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={timetableData.TimetableSchedule}
                                            onChange={(e) => setTimetableData({...timetableData, TimetableSchedule: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-3">
                                {getTimetableForSlot(selectedSlot?.day.formattedDate, selectedSlot?.slot) && (
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        onClick={handleDelete}
                                    >
                                        <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
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

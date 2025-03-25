import React from 'react';

function RightSidebar() {

  return (
    <div className="w-1/5 bg-gray-100 p-6 " >
        <h3 className="text-lg font-bold">Upcoming Classes</h3>
        <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3 rounded-lg">
                <span className="bg-blue-400 p-2 rounded-full"></span>
                    <div>
                        <p className="font-bold text-sm">Mathematics 101</p>
                        <p className="text-xs">Today, 10:30AM</p>
                    </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg">
                <span className="bg-green-400 p-2 rounded-full"></span>
                    <div>
                        <p className="font-bold text-sm">Programming Lab</p>
                        <p className="text-xs">Today, 02:00PM</p>
                    </div>
            </div>
        </div>

        <h3 className="text-lg font-bold mt-6">Recent Grades</h3>
        <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
                <span className="bg-purple-300 p-2 rounded-full"></span>
                    <div>
                        <p className="font-bold text-sm">Quiz 2: 85%</p>
                        <p className="text-xs">Mathematics 101</p>
                    </div>
            </div>
            <div className="flex items-center space-x-3">
                <span className="bg-green-300 p-2 rounded-full"></span>
                <div>
                    <p className="font-bold text-sm">Homework #2: 92%</p>
                    <p className="text-xs">Programming</p>
                </div>
            </div>
        </div>
                
        <h3 className="text-lg font-bold mt-6">View Class</h3>
            <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                    <span className="bg-purple-300 p-2 rounded-full"></span>
                        <div>
                            <p className="font-bold text-sm">GCH1 - Security</p>
                        </div>
                </div>
                    <div className="flex items-center space-x-3">
                        <span className="bg-green-300 p-2 rounded-full"></span>
                        <div>
                            <p className="font-bold text-sm">GCH2 - Game Dev</p>
                        </div>
                    </div>
                </div>
        <h3 className="text-lg font-bold mt-6">Study Resources</h3>
        <div className="mt-4 space-y-2">
            <a href="#" className="block text-blue-500 hover:underline">Mathematics Textbook</a>
            <a href="#" className="block text-blue-500 hover:underline">Programming Reference</a>
            <a href="#" className="block text-blue-500 hover:underline">Physics Lab Manual</a>
        </div>        
    </div>
  );
}

export default RightSidebar;

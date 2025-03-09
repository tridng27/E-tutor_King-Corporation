import React from 'react';

function RightSidebar() {
  return (
                <div className="w-1/5 bg-gray-100 p-6">
                    <div className="flex justify-center items-center mb-20">
                        <button className="bg-white text-black px-6 py-2 rounded-full shadow-md border">Sign Out</button>
                    </div>
                    <h3 className="text-lg font-bold">Upcoming</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg">
                            <span className="bg-yellow-400 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Meeting with Mr Lurah</p>
                                <p className="text-xs">09:20AM <span className="text-orange-500">Due Soon</span></p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg">
                            <span className="bg-yellow-400 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Meeting with Tok Dalang</p>
                                <p className="text-xs">07:00AM <span className="text-orange-500">Due Soon</span></p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold mt-6">Recent Activity</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            <span className="bg-purple-300 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Submission NLP Programming</p>
                                <p className="text-xs">04 Jan, 09:20AM</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="bg-green-300 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Outcome Administration</p>
                                <p className="text-xs">04 Jan, 10:20AM</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold mt-6">Latest Message</h3>
                    <div className="mt-4 flex space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
  )
}

export default RightSidebar;
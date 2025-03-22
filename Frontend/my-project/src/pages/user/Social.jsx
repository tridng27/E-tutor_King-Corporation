
import React from 'react';
import Sidebar from "../../components/sidebar";
import { CircleX, SmilePlus, Mic } from 'lucide-react';
import SocialSidebar from '../../components/socialSidebar';

function Socials() {
  return (
    <div className="relative">
      <div className="flex h-full">
        <Sidebar />

        <div className="flex-1 p-6 ml-16">
          <div className="max-w-3xl mx-auto">
            <div className="">
              <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <CircleX className="absolute right-3 top-2 text-gray-400 hover:text-gray-700 cursor-pointer"/> 
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">

              {/* Post Input */}
              <div className="border p-3 rounded-lg flex items-center">
                <span className="mr-2 text-gray-500">✏️</span>
                <input
                  type="text"
                  placeholder="What’s on your mind right now?"
                  className="w-full outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center mt-3">
                <SmilePlus className="mr-2 text-gray-500 hover:text-gray-700" />
                <Mic className="mr-2 text-gray-500 hover:text-gray-700" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
                  Post ➤
                </button>
              </div>
            </div>
          
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="ml-2">
                        <p className="font-semibold">X_AE_A_13</p>
                        <p className="text-gray-500 text-sm">Product Designer, slothUI</p>
                    </div>
                </div>
                <p className="text-gray-700">Habitant morbi tristique senectus et netus et. Suspendisse sed nisi lacus sed viverra. Dolor morbi non arcu risus quis varius.</p>
                <p className="text-blue-500 text-sm mt-1">#amazing #great #lifetime #uiux #machinelearning</p>
                <img src="#" alt="Post" className="w-full h-48 object-cover mt-2 rounded-lg"/>
                <div className="flex justify-between text-gray-500 text-sm mt-3">
                    <div className="flex items-center">❤️ 12 Likes</div>
                    <div className="flex items-center">💬 25 Comments</div>
                    <div className="flex items-center">🔁 187 Shares</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="ml-2">
                        <p className="font-semibold">Amanda D. Gray</p>
                        <p className="text-gray-500 text-sm">Product Designer, slothUI</p>
                    </div>
                </div>
                <p className="text-gray-700">Habitant morbi tristique senectus et netus et. Suspendisse sed nisi lacus sed viverra. Dolor morbi non arcu risus quis varius.</p>
                <p className="text-blue-500 text-sm mt-1">#amazing #great #lifetime #uiux #machinelearning</p>
                <div className="flex justify-between text-gray-500 text-sm mt-3">
                    <div className="flex items-center">❤️ 12 Likes</div>
                    <div className="flex items-center">💬 25 Comments</div>
                    <div className="flex items-center">🔁 187 Shares</div>
                </div>
              </div>
            </div>
          </div>

        <SocialSidebar/>
      </div>
    </div>
  )
}

export default Socials;
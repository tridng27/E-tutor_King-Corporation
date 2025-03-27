import React from 'react';
import Sidebar from '../../components/sidebar';
import AdminSidebar from '../../components/admin/adminSidebar';

function Course() {
  return (
    <div className="relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 p-6 ml-16 transition-all duration-300">
            <div className="rounded-lg shadow">
              <input type="text" placeholder="Search" className="w-full p-2 border rounded-lg" />
            </div>
            <div class="space-y-4 mt-6">
                  <div class="bg-white p-4 rounded-lg border shadow-md flex flex-col space-y-2">
                      <div class="flex items-center space-x-2">
                          <span class="text-xl">ℹ️</span>
                          <h2 class="font-bold text-lg">COMPTiA Security+</h2>
                      </div>
                      <p class="text-gray-600 text-sm">Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.</p>
                      <button class="bg-green-100 text-green-600 px-3 py-1 rounded-md w-fit">Enroll Now</button>
                  </div>

                  <div class="bg-white p-4 rounded-lg border shadow-md flex flex-col space-y-2">
                      <div class="flex items-center space-x-2">
                          <span class="text-xl">ℹ️</span>
                          <h2 class="font-bold text-lg">COMPTiA A+</h2>
                      </div>
                      <p class="text-gray-600 text-sm">Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.</p>
                      <button class="bg-green-100 text-green-600 px-3 py-1 rounded-md w-fit">Enroll Now</button>
                  </div>

                  <div class="bg-white p-4 rounded-lg border shadow-md flex flex-col space-y-2">
                      <div class="flex items-center space-x-2">
                          <span class="text-xl">ℹ️</span>
                          <h2 class="font-bold text-lg">Unity Dev Starter Pack</h2>
                      </div>
                      <p class="text-gray-600 text-sm">Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.</p>
                      <button class="bg-green-100 text-green-600 px-3 py-1 rounded-md w-fit">Enroll Now</button>
                  </div>

                  <div class="bg-white p-4 rounded-lg border shadow-md flex flex-col space-y-2">
                      <div class="flex items-center space-x-2">
                          <span class="text-xl">ℹ️</span>
                          <h2 class="font-bold text-lg">COMPTiA Generalist Course</h2>
                      </div>
                      <p class="text-gray-600 text-sm">Body text for whatever you’d like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story.</p>
                      <button class="bg-green-100 text-green-600 px-3 py-1 rounded-md w-fit">Enroll Now</button>
                  </div>
            </div>
          </div>

        <AdminSidebar/>
      </div>
    </div>
  );
}
export default Course;
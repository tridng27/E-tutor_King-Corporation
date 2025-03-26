import React from 'react';
import Sidebar from '../../components/sidebar'
import RightSidebar from '../../components/rightSidebar'

function Student() {
  return (
    <div className="relative">
        <div className="flex h-full">
            <Sidebar />
            <div className="flex-1 p-6 ml-16">

            </div>
            <RightSidebar />
        </div>
    </div>
    );
};

export default Student;
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";


function Timetable() {
    return (
        <div className="relative">
            <div className="flex h-screen">
                <Sidebar />

                {/* Nội dung chính */}
                <div className="flex-1 p-6 ml-16 transition-all duration-300">
                <table className="table-auto border-collapse border border-gray-300 w-full text-left">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Time</th>
                                <th className="border border-gray-300 px-4 py-2">Mon</th>
                                <th className="border border-gray-300 px-4 py-2">Tue</th>
                                <th className="border border-gray-300 px-4 py-2">Wed</th>
                                <th className="border border-gray-300 px-4 py-2">Thu</th>
                                <th className="border border-gray-300 px-4 py-2">Fri</th>
                                <th className="border border-gray-300 px-4 py-2">Sat</th>
                                <th className="border border-gray-300 px-4 py-2">Sun</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th className="border border-gray-300 bg-gray-200 px-4 py-2">Slot 1</th>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 2</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 3</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 4</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 5</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 6</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 7</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 8</td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 bg-gray-200 px-4 py-2">Slot 2</th>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 2</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 3</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 4</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 5</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 6</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 7</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 8</td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 bg-gray-200 px-4 py-2">Slot 3</th>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 2</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 3</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 4</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 5</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 6</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 7</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 8</td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 bg-gray-200 px-4 py-2">Slot 4</th>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 2</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 3</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 4</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 5</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 6</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 7</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 8</td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 bg-gray-200 px-4 py-2">Slot 5</th>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 2</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 3</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 4</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 5</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 6</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 7</td>
                                <td className="border border-gray-300 px-4 py-2">Dữ liệu 8</td>
                            </tr>
                        </tbody>
                        </table>
                </div>

                {/* Right sidebar */}
                <RightSidebar />
            </div>
        </div>
    );
}

export default Timetable;

import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";


function Dashboard() {
    return (
        <div className="relative">
            <div className="flex h-screen">
                <Sidebar />

                {/* Nội dung chính */}
                <div className="flex-1 p-6 ml-16 transition-all duration-300">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <input type="text" placeholder="Search" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div className="mt-6 bg-white p-6 rounded-lg shadow">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Class</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2">Text</td>
                                    <td className="p-2 text-blue-500">123@123.com</td>
                                    <td className="p-2 text-green-500">Label</td>
                                    <td className="p-2">2023/09/17</td>
                                    <td className="p-2">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right sidebar */}
                <RightSidebar />
            </div>
        </div>
    );
}

export default Dashboard;

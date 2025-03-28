import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-8xl font-bold text-red-500">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Oops! Page not found</h2>
      <p className="text-gray-600 mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;

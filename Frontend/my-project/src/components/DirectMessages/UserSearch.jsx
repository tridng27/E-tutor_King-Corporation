import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../context/GlobalContext';

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { searchUsers } = useGlobal();

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [query]);

  // In UserSearch.jsx - modify the performSearch function
const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Performing search with query:", query); // Add this for debugging
      const result = await searchUsers(query);
      console.log("Raw search result:", result); // Add this for debugging
      
      // Check the structure of the result
      if (result && Array.isArray(result)) {
        setResults(result);
      } else if (result && result.data && Array.isArray(result.data)) {
        setResults(result.data);
      } else {
        console.error("Unexpected search result format:", result);
        setResults([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setError('Failed to search users');
      setResults([]);
      setLoading(false);
    }
  };  

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {query.trim().length >= 2 
              ? 'No users found' 
              : 'Type at least 2 characters to search'}
          </div>
        ) : (
          results.map(user => (
            <div
              key={user.UserID}
              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => onSelectUser(user)}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                {user.Name ? user.Name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{user.Name}</h4>
                <p className="text-sm text-gray-600">{user.Email}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {user.Role}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSearch;

import React from 'react';

function DebugPanel({ 
  debugInfo, 
  error, 
  isAuthenticated, 
  user, 
  posts, 
  isLoadingPosts, 
  isRefreshing, 
  authError,
  handleTestAuth,
  checkCookie,
  handleRefresh
}) {
  return (
    <div className="bg-yellow-100 p-4 mb-4 rounded text-xs">
      <h3 className="font-bold text-sm mb-2">Debug Panel</h3>
      
      <div className="flex space-x-2 mb-2">
        <button
          onClick={handleTestAuth}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Test Auth
        </button>
        <button
          onClick={checkCookie}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
        >
          Check Cookie
        </button>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-2 py-1 ${isRefreshing ? 'bg-gray-400' : 'bg-purple-500'} text-white rounded text-xs`}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Posts'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p><strong>Auth:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User:</strong> {user ? `${user.Name} (${user.Role})` : 'Not logged in'}</p>
          <p><strong>Posts:</strong> {posts?.length || 0}</p>
          <p><strong>Loading:</strong> {isLoadingPosts ? '⏳ Yes' : '✅ No'}</p>
          <p><strong>Refreshing:</strong> {isRefreshing ? '⏳ Yes' : '✅ No'}</p>
          {authError && <p className="text-red-600"><strong>Auth Error:</strong> {authError}</p>}
        </div>
        <div>
          {Object.entries(debugInfo).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {value}</p>
          ))}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700"><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
}

export default DebugPanel;

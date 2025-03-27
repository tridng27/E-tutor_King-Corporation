import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';

function PostItem({ post, onLike }) {
  // Function to safely render sanitized HTML content
  const renderSanitizedHTML = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="ml-2">
          <p className="font-semibold">{post.User?.Name || 'Unknown User'}</p>
          <p className="text-gray-500 text-sm">
            {post.User?.Role || 'User'} • {
              post.CreatedAt
                ? formatDistanceToNow(new Date(post.CreatedAt), { addSuffix: true })
                : 'recently'
            }
          </p>
        </div>
      </div>
     
      {/* Render sanitized HTML content safely */}
      <div 
        className="text-gray-700"
        dangerouslySetInnerHTML={renderSanitizedHTML(post.Content)}
      ></div>
     
      {Array.isArray(post.Hashtags) && post.Hashtags.length > 0 && (
        <p className="text-blue-500 text-sm mt-1">
          {post.Hashtags.map(tag => `#${tag}`).join(' ')}
        </p>
      )}
     
      {post.ImageURL && (
        <img
          src={post.ImageURL}
          alt="Post"
          className="w-full h-48 object-cover mt-2 rounded-lg"
        />
      )}
     
      <div className="flex justify-between text-gray-500 text-sm mt-3">
        <button
          onClick={() => onLike(post.PostID)}
          className="flex items-center hover:text-blue-500"
        >
          ❤️ {post.Likes || 0} Likes
        </button>
        <div className="flex items-center">💬 {post.Comments?.length || 0} Comments</div>
        <div className="flex items-center">🔁 {post.Shares || 0} Shares</div>
      </div>
    </div>
  );
}

export default PostItem;

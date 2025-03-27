import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style'; // Add this import
import apiService from '../../services/apiService';

function CreatePostForm({ createPost }) {
  const [hashtags, setHashtags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle, // This is required for FontFamily and Color
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Image
    ],
    content: ''
  })

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const postContent = editor?.getHTML();
   
    if (!postContent || !editor?.getText().trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const hashtagArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1));

      const postData = {
        content: postContent,
        hashtags: hashtagArray
      };
     
      const result = await createPost(postData);
     
      // Reset form
      editor?.commands.setContent('');
      setHashtags('');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(`Failed to create post: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
   
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          // Create a FormData instance
          const formData = new FormData();
          formData.append('image', file);
          
          // Use the updated apiService
          const response = await apiService.post('/upload/image', formData);
          
          // Get the image URL from the response
          const imageUrl = response.data.url;
          
          // Insert the image into the editor
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          console.error('Error uploading image:', error);
          setError(`Failed to upload image: ${error.message || 'Unknown error'}`);
        }
      }
    };
  };
  
  
  if (!editor) {
    return null;
  }

  const fontFamilies = [
    { name: 'Default', value: 'Inter, system-ui, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <form onSubmit={handleSubmitPost}>
        <div className="mb-3 rounded-lg overflow-hidden shadow-sm">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
            {/* Font Family Dropdown */}
            <select
              onChange={(e) => {
                editor.chain().focus().setFontFamily(e.target.value).run();
              }}
              className="px-2 py-1 rounded border border-gray-300 text-sm"
            >
              <option value="">Font Family</option>
              {fontFamilies.map((font) => (
                <option key={font.name} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
           
            {/* Text Formatting Buttons */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-2 py-1 rounded text-sm ${
                editor.isActive('bold')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-gray-300'
              }`}
            >
              Bold
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-2 py-1 rounded text-sm ${
                editor.isActive('italic')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-gray-300'
              }`}
            >
              Italic
            </button>
           
            {/* Text Color Dropdown */}
            <select
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="px-2 py-1 rounded border border-gray-300 text-sm"
            >
              <option value="">Text Color</option>
              <option value="#000000" style={{ color: '#000000' }}>Black</option>
              <option value="#FF0000" style={{ color: '#FF0000' }}>Red</option>
              <option value="#0000FF" style={{ color: '#0000FF' }}>Blue</option>
              <option value="#008000" style={{ color: '#008000' }}>Green</option>
              <option value="#FFA500" style={{ color: '#FFA500' }}>Orange</option>
              <option value="#800080" style={{ color: '#800080' }}>Purple</option>
            </select>
           
            {/* Image Button */}
            <button
              type="button"
              onClick={addImage}
              className="px-2 py-1 rounded text-sm bg-white border border-gray-300"
            >
              Add Image
            </button>
          </div>
         
          {/* Editor Content Area */}
          <EditorContent
            editor={editor}
            className="p-3 min-h-[150px] focus:outline-none"
          />
        </div>
       
        {/* Hashtags Input - Borderless */}
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="Add hashtags (e.g. #learning #coding)"
          className="w-full p-3 rounded-lg focus:outline-none bg-gray-50 placeholder-gray-400 text-sm"
          style={{ border: 'none' }}
        />
       
        {/* Submit Button */}
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSubmitting || !editor?.getText().trim()}
            className={`px-4 py-2 rounded-lg text-white ${
              isSubmitting || !editor?.getText().trim()
                ? 'bg-blue-300'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
       
        {/* Error Message */}
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </form>
    </div>
  );
}

export default CreatePostForm;

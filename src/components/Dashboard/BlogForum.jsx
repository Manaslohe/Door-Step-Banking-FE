import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  BookOpen, 
  ThumbsUp, 
  Bookmark,
  Share2
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const BlogCard = ({ blog, onLike, onBookmark }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        {/* Blog Category Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
            {blog.category || 'Investment'}
          </span>
          <span className="text-sm text-gray-500">
            {blog.readTime || '5 min read'}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
          {blog.title}
        </h2>

        <div className={`text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
          {blog.content}
        </div>

        {blog.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Author and Interaction Section */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {blog.author[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{blog.author}</p>
                <p className="text-sm text-gray-500">{blog.date || 'Today'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => onLike(blog.id)}
                className={`flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors ${blog.isLiked ? 'text-blue-600' : ''}`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm">{blog.likes || 0}</span>
              </button>
              <button 
                onClick={() => onBookmark(blog.id)}
                className={`flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors ${blog.isBookmarked ? 'text-blue-600' : ''}`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-blue-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogForum = ({ user = { name: "Financial Expert" } }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Create 4 financial blog posts. Format the response as a valid JSON array of objects. Each object should have exactly two fields: 'title' and 'content'. Example format: [{\"title\":\"First Post\",\"content\":\"Content here\"},{\"title\":\"Second Post\",\"content\":\"Content here\"}]. Focus on investment trends and banking advice."
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        let blogData;
        const text = data.candidates[0].content.parts[0].text;
        const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
          blogData = JSON.parse(jsonString);
          
          if (!Array.isArray(blogData)) {
            throw new Error('Response is not an array');
          }
          
          const newBlogs = blogData.map((blog, index) => ({
            id: Date.now() + index,
            title: blog.title || "Financial Insights",
            content: blog.content || "Loading content...",
            author: user.name,
            likes: Math.floor(Math.random() * 50),
            isLiked: false,
            isBookmarked: false,
            category: ['Investment', 'Banking', 'Markets', 'Personal Finance'][Math.floor(Math.random() * 4)],
            readTime: `${Math.floor(Math.random() * 10 + 3)} min read`
          }));
          
          setBlogs(newBlogs);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error("Error generating blogs:", error);
      setBlogs([{
        id: Date.now(),
        title: "Error Loading Content",
        content: "Unable to generate blog posts at the moment. Please try again later.",
        author: user.name,
        category: 'Error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateBlogs();
  }, []);

  const handleLike = (blogId) => {
    setBlogs(blogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          isLiked: !blog.isLiked,
          likes: blog.isLiked ? blog.likes - 1 : blog.likes + 1
        };
      }
      return blog;
    }));
  };

  const handleBookmark = (blogId) => {
    setBlogs(blogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          isBookmarked: !blog.isBookmarked
        };
      }
      return blog;
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-6 relative bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Simplified Header Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
              </div>
              
              <button
                onClick={generateBlogs}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Content
              </button>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading fresh insights...</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogForum;
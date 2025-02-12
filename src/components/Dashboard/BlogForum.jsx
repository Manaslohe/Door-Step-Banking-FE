import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  BookOpen, 
  ThumbsUp,
  PenSquare,
  X,
  Send,
  Clock,
  ChevronUp,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useTranslation } from '../../context/TranslationContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const LoadingCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex gap-2 mb-4">
      <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="w-3/4 h-8 bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <div className="w-full h-4 bg-gray-200 rounded"></div>
      <div className="w-full h-4 bg-gray-200 rounded"></div>
      <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const BlogCard = ({ blog, onLike }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium 
            hover:bg-blue-100 transition-colors cursor-default">
            {blog.category}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {blog.readTime}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 
          cursor-pointer transition-colors group">
          {blog.title}
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </h2>

        <div className={`text-gray-600 leading-relaxed prose-sm max-w-none
          transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {blog.content}
        </div>

        {blog.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3
              flex items-center gap-1 group"
          >
            {isExpanded ? (
              <>
                {t.blog.showLess}
                <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                {t.blog.readMore}
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 
                rounded-full flex items-center justify-center text-white font-medium
                shadow-inner">
                {blog.author[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{blog.author}</p>
                <p className="text-sm text-gray-500">{blog.date || 'Today'}</p>
              </div>
            </div>

            <button 
              onClick={() => onLike(blog.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full 
                transition-all duration-300 transform active:scale-95
                ${blog.isLiked 
                  ? 'bg-blue-100 text-blue-600 scale-105 hover:bg-blue-200' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              <ThumbsUp className={`w-5 h-5 transition-transform duration-300
                ${blog.isLiked ? 'fill-current animate-[like_0.5s_ease-in-out]' : ''}`} />
              <span className="text-sm font-medium">{blog.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateBlogModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      setTitle('');
      setContent('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
      justify-center z-50 transition-opacity duration-300
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-xl
        transition-all duration-300 transform
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {showSuccess ? (
          <div className="text-center py-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center 
              justify-center mx-auto mb-4 animate-[scaleIn_0.5s_ease-out]">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Blog Posted Successfully!</h3>
            <p className="text-gray-600">Your blog has been shared with the community.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Blog</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>Post Blog</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const BlogForum = ({ user = { name: "Financial Expert" } }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t, language } = useTranslation();

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
                text: t.blog.generatePrompt
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
            title: blog.title || t.blog.title,
            content: blog.content || t.blog.loadingInsights,
            author: user.name,
            likes: Math.floor(Math.random() * 50),
            isLiked: false,
            isBookmarked: false,
            category: [
              t.blog.categories.investment,
              t.blog.categories.banking,
              t.blog.categories.markets,
              t.blog.categories.personalFinance
            ][Math.floor(Math.random() * 4)],
            readTime: `${Math.floor(Math.random() * 10 + 3)} ${t.blog.minRead}`
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
        title: t.blog.errorLoading,
        content: t.blog.errorMessage,
        author: user.name,
        category: t.blog.categories.error
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

  return (
    <DashboardLayout>
      <div className="p-6 relative bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t.blog.title}</h1>
                  <p className="text-gray-500 text-sm">{t.blog.subtitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r 
                    from-green-500 to-green-600 text-white rounded-lg 
                    hover:from-green-600 hover:to-green-700 transition-all duration-300
                    transform active:scale-95 shadow-sm"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>{t.blog.createButton}</span>
                </button>
                <button
                  onClick={generateBlogs}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r 
                    from-blue-500 to-blue-600 text-white rounded-lg
                    hover:from-blue-600 hover:to-blue-700 transition-all duration-300
                    transform active:scale-95 shadow-sm disabled:opacity-50
                    disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? t.blog.generating : t.blog.refreshContent}
                </button>
              </div>
            </div>
          </div>

          {/* Blog Grid with Loading State */}
          <div className="grid gap-6">
            {loading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map(i => <LoadingCard key={i} />)}
              </div>
            ) : (
              <div className="grid gap-6 animate-[fadeIn_0.5s_ease-out]">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onLike={handleLike}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateBlogModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Add to your CSS or tailwind.config.js */}
      <style jsx>{`
        @keyframes like {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default BlogForum;
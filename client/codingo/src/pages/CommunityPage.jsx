import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaPaperPlane, 
  FaImage, 
  FaTimes,
  FaTrash,
  FaFire,
  FaCrown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInitialAvatar(name) {
  const initial = (name || '?')[0].toUpperCase();
  const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500'];
  const colorIndex = initial.charCodeAt(0) % colors.length;
  return (
    <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
      {initial}
    </div>
  );
}

function formatTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be less than 3MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setError('Only JPEG, PNG, or WEBP images allowed');
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    if (content.length > 2000) {
      setError('Post exceeds 2000 characters');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(`${apiUrl}/api/community/posts`, formData, {
        withCredentials: true,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      setContent('');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
      <h3 className="text-lg font-bold mb-4">Share with the Community</h3>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share your learning journey..."
        className="w-full bg-[#141b24] text-white rounded-lg p-4 border border-[#1f2a38] focus:border-cyan-500 focus:outline-none resize-none"
        rows="4"
        maxLength="2000"
      />

      {imagePreview && (
        <div className="relative mt-4 inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-w-full max-h-64 rounded-lg border border-[#2a3a4a]"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleImageSelect}
            className="hidden"
            id="post-image-upload"
          />
          <label
            htmlFor="post-image-upload"
            className="flex items-center gap-2 px-4 py-2 bg-[#1f2a38] hover:bg-[#243547] rounded-lg text-sm font-semibold cursor-pointer transition"
          >
            <FaImage /> Add Image
          </label>
          <span className="text-xs text-gray-500">{content.length}/2000</span>
        </div>

        <button
          type="button"
          onClick={handlePost}
          disabled={!content.trim() || isPosting}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
        >
          {isPosting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Posting...
            </>
          ) : (
            <>
              <FaPaperPlane /> Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PostCard({ post, currentUserId, onLike, onComment, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setIsCommenting(true);
    try {
      await axios.post(
        `${apiUrl}/api/community/posts/${post.id}/comments`,
        { content: commentText.trim() },
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      setCommentText('');
      if (onComment) {
        onComment(post.id);
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${apiUrl}/api/community/posts/${post.id}/comments/${commentId}`,
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      if (onComment) {
        onComment(post.id);
      }
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const isOwnPost = post.author.id === currentUserId;

  return (
    <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className={`flex items-center gap-3 ${post.author.id ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={() => post.author.id && navigate(`/profile/${post.author.id}`)}
        >
          {post.author.profilePic ? (
            <img 
              src={post.author.profilePic} 
              alt={post.author.username} 
              className="w-12 h-12 rounded-full border-2 border-[#2a3a4a]"
            />
          ) : (
            getInitialAvatar(post.author.username)
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{post.author.username}</span>
              {post.author.league?.includes('Diamond') && (
                <FaCrown className="text-orange-400 text-sm" />
              )}
              {post.author.league?.includes('Platinum') && (
                <FaCrown className="text-cyan-400 text-sm" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Level {post.author.level}</span>
              <span>•</span>
              <span>{post.author.league}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {isOwnPost && (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="text-gray-500 hover:text-red-400 transition"
            title="Delete post"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-wrap break-words">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-4">
          <img 
            src={post.image} 
            alt="Post" 
            className="w-full rounded-lg border border-[#2a3a4a] max-h-96 object-contain bg-[#0f1419]"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 py-3 border-t border-[#1f2a38]">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 font-semibold transition ${
            post.isLikedByCurrentUser 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          {post.isLikedByCurrentUser ? <FaHeart /> : <FaRegHeart />}
          <span>{post.likesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 font-semibold transition"
        >
          <FaComment />
          <span>{post.commentsCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#1f2a38]">
          {/* Comment Input */}
          <div className="flex gap-3 mb-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-[#141b24] text-white rounded-lg p-3 border border-[#1f2a38] focus:border-cyan-500 focus:outline-none resize-none"
              rows="2"
              maxLength="500"
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={!commentText.trim() || isCommenting}
              className="self-end px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {isCommenting ? '...' : 'Post'}
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-2">No comments yet. Be the first!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      {comment.author.profilePic ? (
                        <img 
                          src={comment.author.profilePic} 
                          alt={comment.author.username} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        getInitialAvatar(comment.author.username)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{comment.author.username}</span>
                        {(comment.author.id === currentUserId || isOwnPost) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-400 text-xs transition"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm break-words">{comment.content}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id || currentUser?._id || '';

  const fetchPosts = useCallback(async (pageNum) => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`${apiUrl}/api/community/feed?page=${pageNum}&limit=10`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      const newPosts = response.data.posts || [];
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(response.data.pagination?.hasMore || false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, isLoading]);

  useEffect(() => {
    fetchPosts(1);
  }, []);

  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [page, hasMore, isLoading, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/community/posts/${postId}/like`,
        {},
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: response.data.likesCount,
            isLikedByCurrentUser: response.data.isLiked
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async (postId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/community/posts/${postId}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      setPosts(prev => prev.map(post => 
        post.id === postId ? response.data.post : post
      ));
    } catch (err) {
      console.error('Refresh post error:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`${apiUrl}/api/community/posts/${postId}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <FaFire className="text-4xl text-orange-400" />
            <div>
              <h1 className="text-3xl font-bold">Community</h1>
              <p className="text-gray-400 text-sm">Connect with learners worldwide</p>
            </div>
          </div>
        </div>

        {/* Post Composer */}
        <PostComposer onPostCreated={handlePostCreated} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 && !isLoading ? (
            <div className="bg-[#1a2332] rounded-2xl p-12 border border-[#2a3a4a] text-center">
              <p className="text-gray-400 mb-4">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDelete}
              />
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {hasMore && !isLoading && (
            <div ref={loadingRef} className="h-10"></div>
          )}

          {/* End of Feed */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              You've reached the end of the feed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

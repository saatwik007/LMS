import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { setError, setImage, setImagePreview } from "../redux/slices/postSlice";

const apiUrl = import.meta.env.VITE_API_URL || '';
const dispatch = useDispatch;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const formatTimeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60) return 'just now';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString();
}

 export const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { dispatch(setError('Image must be < 3MB')); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      dispatch(setError('Only JPEG, PNG, WEBP allowed')); return;
    }
    dispatch(setImage(file));
    dispatch(setImagePreview(URL.createObjectURL(file)));
    dispatch(setError(''));
  };

export const fetchPosts = createAsyncThunk(
  'feed/fetchPosts',
  async (pageNum, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${apiUrl}/api/community/feed?page=${pageNum}&limit=10`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      const newPosts = res.data.posts || [];

      return {
        posts: newPosts,
        pageNum,
        hasMore: res.data.pagination?.hasMore || false,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load posts');
    }
  }
);

 export const handleLike = createAsyncThunk(
  'feed/handleLike',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${apiUrl}/api/community/posts/${postId}/like`, {}, {
        withCredentials: true, headers: getAuthHeaders(),
      });
      return{
          postId,
          likesCount: res.data.likesCount,
          isLiked: res.data.isLiked,
        }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to like post');
    }
  }
);

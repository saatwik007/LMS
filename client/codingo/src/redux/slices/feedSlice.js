import { createSlice } from "@reduxjs/toolkit";
import { fetchPosts, handleLike } from "../../utilites/communityHelper";

const feedSlice = createSlice({
    name: 'feed',
    initialState: {
        showComments: {},
        commentText: {},
        isCommenting: {},
        liked: {},
        likeCounts: {},
        heartAnim: {},
        showModal: false,
        posts: [],
        page: 1,
        hasMore: true,
        isLoading: false,
        error: '',
    },
    reducers: {
        setShowComments: (state, action) => {
            const { postId, value } = action.payload;
            state.showComments[postId] = value;
        },
        setCommentText: (state, action) => {
            const { postId, value } = action.payload;
            state.commentText[postId] = value;
        },
        setIsCommenting: (state, action) => {
            const { postId, value } = action.payload;
            state.isCommenting[postId] = value;
        },
        toggleLike: (state, action) => {
            const id = action.payload;
            const isLiked = state.liked[id];
            state.liked[id] = !isLiked;
            state.likeCounts[id] = isLiked ? (state.likeCounts[id] || 1) - 1 : (state.likeCounts[id] || 0) + 1;
        },
        toggleComments: (state, action) => {
            const id = action.payload;
            state.showComments[id] = !state.showComments[id];
        },
        setLiked: (state, action) => {
            const { postId, value } = action.payload;
            state.liked[postId] = value;
        },
        setLikeCount: (state, action) => {
            const { postId, value } = action.payload;
            state.likeCounts[postId] = value;
        },
        setHeartAnim: (state, action) => {
            const { postId, value } = action.payload;
            state.heartAnim[postId] = value;
        },
        setShowModal: (state, action) => {
            state.showModal = action.payload;
        },
        initPost: (state, action) => {
            const postId = action.payload;
            state.showComments[postId] = false;
            state.commentText[postId] = '';
            state.isCommenting[postId] = false;
            state.liked[postId] = false;
            state.likeCounts[postId] = 0;
            state.heartAnim[postId] = false;
        },
       setPosts: (state, action) => {
  if (typeof action.payload === 'function') {
    state.posts = action.payload(state.posts);
  } else {
    state.posts = action.payload;
  }
},
         setPage: (state, action) => {
            state.page = action.payload;
        },
        setHasMore: (state, action) => {
            state.hasMore = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
      extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { posts, pageNum, hasMore } = action.payload;
        state.isLoading = false;
        state.hasMore = hasMore;

        if (pageNum === 1) {
          state.posts = posts;
        } else {
          state.posts = [...state.posts, ...posts];
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      builder
      .addCase(handleLike.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(handleLike.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked } = action.payload;
        state.posts = state.posts.map(p =>
          p.id === postId ? { ...p, likesCount: likesCount, isLikedByCurrentUser: isLiked } : p
        );
        state.isLoading = false;
      })
        .addCase(handleLike.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        })
  },
});

export const { setShowComments, setCommentText, setIsCommenting, toggleLike, toggleComments, setLiked, setLikeCount, setHeartAnim, setShowModal, initPost, setPosts, setPage, setHasMore, setIsLoading, setError } = feedSlice.actions;
export default feedSlice.reducer;
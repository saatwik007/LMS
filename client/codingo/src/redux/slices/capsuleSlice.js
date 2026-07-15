import { createSlice } from "@reduxjs/toolkit";

const capsuleSlice = createSlice ({
    name: 'capsule',
    initialState: {
        capsule: [],
        caption: '',
        isCapsulePosting: false,
        error: null
    },
    reducers: {
        setCapsule: (state, action) => {
            state.capsule = action.payload;
        },
        setCaption: (state, action) => {
            state.caption = action.payload
        },
        setIsCapsulePosting: (state, action) => {
            state.isCapsulePosting = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    },
})

export const {setCapsule, setCaption, setIsCapsulePosting, setError} = capsuleSlice.actions;
export default capsuleSlice.reducer;
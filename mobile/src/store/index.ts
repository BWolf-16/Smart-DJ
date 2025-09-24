import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducers
const authSlice = {
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {}
};

const musicSlice = {
  name: 'music',
  initialState: { currentTrack: null, playlist: [] },
  reducers: {}
};

export const store = configureStore({
  reducer: {
    auth: (state = authSlice.initialState) => state,
    music: (state = musicSlice.initialState) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
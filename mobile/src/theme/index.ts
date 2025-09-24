import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1DB954', // Spotify green
    accent: '#FF0000', // YouTube red
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    placeholder: '#B3B3B3',
    disabled: '#404040',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 8,
};
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#8BC34A', // Fresh Green - healthy, natural
    secondary: '#FF9800', // Carrot Orange - vibrant
    tertiary: '#FFC107', // Honey Gold - accent
    background: '#FAFAF8', // Off-white - clean
    surface: '#FFFFFF',
    onSurface: '#37474F', // Slate Grey text
    onBackground: '#37474F',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8BC34A',
    secondary: '#FF9800',
    tertiary: '#FFC107',
  },
};


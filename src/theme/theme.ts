import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import Colors from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary.main,          // #B15912
    secondary: Colors.secondary.main,      // #517831
    tertiary: Colors.primary.light,        // #B77E30
    error: Colors.status.error,            // #CB4D44
    background: Colors.background.default, // #fff8e1
    surface: Colors.background.paper,      // #ffffff
    surfaceVariant: '#F5F5F5',
    onPrimary: Colors.text.inverse,        // #ffffff
    onSecondary: Colors.text.inverse,      // #ffffff
    onBackground: Colors.text.primary,     // #0C1607
    onSurface: Colors.text.primary,        // #0C1607
    onTertiary: Colors.text.inverse,       // #ffffff
    outline: Colors.secondary.darkRed,     // #4C1615
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary.light,         // #B77E30 (lighter for dark mode)
    secondary: Colors.secondary.main,      // #517831
    tertiary: Colors.primary.main,         // #B15912
    error: Colors.status.error,            // #CB4D44
    background: Colors.background.dark,    // #0C1607
    surface: Colors.secondary.darkRed,     // #4C1615
    surfaceVariant: '#1A1A1A',
    onSurface: Colors.background.default,  // #fff8e1
    onBackground: Colors.background.default, // #fff8e1
    onPrimary: Colors.text.inverse,        // #ffffff
    onSecondary: Colors.text.inverse,      // #ffffff
    onTertiary: Colors.text.inverse,       // #ffffff
    outline: Colors.primary.light,         // #B77E30
  },
};

export { Colors };

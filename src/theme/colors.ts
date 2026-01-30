/**
 * RecipeStash Color Palette
 * 
 * This file contains all the color definitions used throughout the app.
 * Update colors here to maintain consistency across the entire application.
 */

export const Colors = {
  // Primary Colors
  primary: {
    main: '#B15912',      // Primary orange - main brand color
    light: '#B77E30',     // Light orange - hover states, lighter elements
    dark: '#0C1607',      // Very dark - text, dark backgrounds
  },

  // Secondary Colors
  secondary: {
    main: '#517831',      // Green - secondary actions, success states
    red: '#CB4D44',       // Red - delete, errors, warnings
    darkRed: '#4C1615',   // Dark red - darker error states
  },

  // UI Colors
  background: {
    default: '#fff8e1',   // Light cream - main background
    paper: '#ffffff',     // White - cards, surfaces
    dark: '#0C1607',      // Very dark - dark mode background
  },

  text: {
    primary: '#0C1607',   // Very dark - primary text
    secondary: '#666666', // Gray - secondary text
    disabled: '#999999',  // Light gray - disabled text
    inverse: '#ffffff',   // White - text on dark backgrounds
  },

  // Semantic Colors
  status: {
    success: '#517831',   // Green - success messages
    error: '#CB4D44',     // Red - error messages
    warning: '#B77E30',   // Light orange - warnings
    info: '#B15912',      // Primary orange - info messages
  },

  // Social/Interaction Colors
  interaction: {
    like: '#e91e63',      // Pink - likes/hearts
    comment: '#666666',   // Gray - comments
    share: '#2196f3',     // Blue - share actions
  },

  // Border & Divider Colors
  border: {
    light: '#f0f0f0',     // Very light gray - subtle borders
    main: '#e0e0e0',      // Light gray - standard borders
    dark: '#cccccc',      // Medium gray - prominent borders
  },

  // Difficulty Levels
  difficulty: {
    easy: '#517831',      // Green - easy recipes
    medium: '#B77E30',    // Light orange - medium recipes
    hard: '#CB4D44',      // Red - hard recipes
  },

  // Overlay & Shadow
  overlay: 'rgba(12, 22, 7, 0.5)',  // Dark overlay with transparency
  shadow: 'rgba(0, 0, 0, 0.1)',     // Shadow color
};

// Helper function to add transparency to colors
export const addAlpha = (color: string, alpha: number): string => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Export convenience aliases
export const BrandColors = {
  primaryOrange: Colors.primary.main,
  lightOrange: Colors.primary.light,
  primaryGreen: Colors.secondary.main,
  primaryRed: Colors.secondary.red,
  darkRed: Colors.secondary.darkRed,
  veryDark: Colors.primary.dark,
};

export default Colors;

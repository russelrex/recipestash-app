/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#B15912';
const tintColorDark = '#B77E30';

export const Colors = {
  light: {
    text: '#0C1607',
    background: '#FAFAF8',
    tint: tintColorLight,
    icon: '#4C1615',
    tabIconDefault: '#4C1615',
    tabIconSelected: tintColorLight,
    primary: '#B15912',
    secondary: '#B77E30',
    tertiary: '#517831',
    error: '#CB4D44',
  },
  dark: {
    text: '#FAFAF8',
    background: '#0C1607',
    tint: tintColorDark,
    icon: '#B77E30',
    tabIconDefault: '#B77E30',
    tabIconSelected: tintColorDark,
    primary: '#B77E30',
    secondary: '#B15912',
    tertiary: '#517831',
    error: '#CB4D44',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme';

export const commonStyles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  
  // Inputs (ALWAYS FULL WIDTH)
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
  },
  
  // Buttons (ALWAYS FULL WIDTH unless specified)
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  
  // Cards
  card: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Headers
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(12, 22, 7, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  
  // Sections
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
});

// Brand colors (re-exported from theme for convenience)
export const colors = {
  primary: Colors.primary.main,
  background: Colors.background.default,
  surface: 'rgba(255, 255, 255, 0.9)',
  text: Colors.text.primary,
  green: Colors.secondary.main,
  dark: Colors.primary.dark,
  error: Colors.status.error,
};

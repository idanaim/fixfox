import { StyleSheet } from 'react-native';

// Slack-inspired color palette
export const colors = {
  primary: '#4A154B', // Slack purple
  secondary: '#36C5F0', // Slack blue
  accent: '#ECB22E', // Slack yellow
  success: '#2EB67D', // Slack green
  error: '#E01E5A', // Slack pink
  dark: '#1D1C1D', // Dark text
  medium: '#616061', // Medium gray text
  light: '#868686', // Light text
  lightGray: '#F8F8F8', // Background gray
  border: '#DDDDDD', // Border color
  white: '#FFFFFF',
  background: '#FFFFFF', // Add background color
};

// Typography scale
export const typography = {
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.25,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.15,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.15,
  },
  h6: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.15,
  },
  body1: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 1.25,
    textTransform: 'uppercase' as const,
  },
};

// Spacing scale
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Shadows
const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 8,
  },
};

// Define the extended StyleSheet type
interface ExtendedStyleSheet {
  colors: typeof colors;
  typography: typeof typography;
  [key: string]: any;
}

// Create and export the styles object
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: colors.white,
    ...typography.h2,
  },
  languageSwitcherContainer: {
    marginRight: 8,
  },
  dashboardSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 21, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.dark,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.medium,
  },
  badge: {
    backgroundColor: colors.error,
    color: colors.white,
    fontSize: 8,
    top: -2,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  navButtonLabel: {
    ...typography.caption,
    color: colors.medium,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contentTitle: {
    ...typography.h3,
    color: colors.dark,
  },
  addButton: {
    margin: 0,
    backgroundColor: 'rgba(74, 21, 75, 0.1)',
  },
  scrollContent: {
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  comingSoonText: {
    ...typography.h3,
    color: colors.medium,
    marginTop: 16,
  },
  // User list styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body1,
    color: colors.dark,
  },
  userRole: {
    ...typography.caption,
    color: colors.medium,
  },
  actionButton: {
    marginLeft: 8,
  },
  // Department styles
  departmentCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  departmentName: {
    ...typography.h3,
    color: colors.dark,
  },
  departmentEmployees: {
    ...typography.caption,
    color: colors.medium,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 20,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: colors.medium,
  },
  cancelButtonText: {
    color: colors.white,
  },
  // Business section styles
  sectionCard: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.dark,
  },
  businessActions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 8,
  },
  label: {
    ...typography.body2,
    color: colors.dark,
    marginBottom: 4,
  },
});

// Create the exported styles object with extra properties
export const styles = {
  ...baseStyles,
  colors,
  typography,
} as ExtendedStyleSheet;

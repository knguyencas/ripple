import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

const APP_BLUE = '#2E6F8E';
const INPUT_BG = '#F8FAFC';
const INPUT_BORDER = '#DEE7ED';
const WEB_INPUT_RESET = Platform.OS === 'web'
  ? ({ outlineStyle: 'none', outlineWidth: 0, boxShadow: 'none' } as any)
  : {};

export const cardShadow: any = Platform.OS === 'web'
  ? { boxShadow: '0 2px 8px rgba(26,58,92,0.07)' }
  : { shadowColor: '#1A3A5C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 };

export const commonStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.foam,
  },

  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },

  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sectionSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: -8,
  },

  inputGroup: {
    gap: Spacing.xs,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textPrimary,
  },
  input: {
    ...WEB_INPUT_RESET,
    backgroundColor: INPUT_BG,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textPrimary,
  },

  btnPrimary: {
    backgroundColor: APP_BLUE,
    borderRadius: Spacing.radiusFull,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: APP_BLUE,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: Spacing.radiusFull,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: Colors.teal,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textLight,
  },
  btnTextSecondary: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: APP_BLUE,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    borderWidth: 0.8,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
});

import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

const AUTH_BLUE = '#2E6F8E';
const AUTH_INPUT_BG = '#EAF7FB';
const AUTH_INPUT_BORDER = '#DEE7ED';
const WEB_INPUT_RESET = Platform.OS === 'web'
  ? ({ outlineStyle: 'none', outlineWidth: 0, boxShadow: 'none' } as any)
  : {};

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.foam,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 36,
  },
  wave1: {
    display: 'none',
  },
  wave2: {
    display: 'none',
  },
  header: {
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 32,
  },
  registerBackButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: AUTH_BLUE,
    fontSize: 32,
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  titleCentered: {
    ...Typography.h1,
    color: AUTH_BLUE,
    fontSize: 32,
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodySecondary,
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  subtitleCentered: {
    ...Typography.bodySecondary,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  headerCentered: {
    alignItems: 'center',
    paddingTop: 92,
    paddingBottom: 34,
  },
  form: {
    gap: 18,
    alignSelf: 'stretch',
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  input: {
    ...WEB_INPUT_RESET,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    borderWidth: 0.8,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  error: {
    color: Colors.alertHigh,
    fontSize: 13,
    textAlign: 'center',
  },
  warning: {
    color: '#B86E00',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  pinDigitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  pinDigitBox: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: AUTH_INPUT_BORDER,
    backgroundColor: AUTH_INPUT_BG,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pinDigitBoxFilled: {
    borderColor: AUTH_BLUE,
    backgroundColor: '#FFFFFF',
  },
  btnPrimary: {
    backgroundColor: Colors.teal,
    borderRadius: Spacing.radiusFull,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    ...Typography.button,
    fontSize: 16,
  },
  btnSecondary: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  btnSecondaryText: {
    ...Typography.bodySecondary,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  btnSecondaryLink: {
    color: AUTH_BLUE,
    fontWeight: '600',
  },
  socialSection: {
    gap: 14,
    marginTop: 2,
  },
  socialDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(46,111,142,0.16)',
  },
  socialDividerText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.8,
    borderColor: AUTH_INPUT_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#1A3A5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  socialButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ageBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusFull,
    borderWidth: 0.8,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ageBtnActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  ageBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ageBtnTextActive: {
    color: Colors.textLight,
    fontWeight: '600',
  },
});

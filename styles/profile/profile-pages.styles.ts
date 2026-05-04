import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const profilePageStyles = StyleSheet.create({
  flex: { flex: 1 },
  scrollBottom: { paddingBottom: 128 },
  scrollBottomLarge: { paddingBottom: 128 },
  content: { paddingHorizontal: 20 },
});

export const profileEditPageStyles = StyleSheet.create({
  avatarPreview: {
    alignSelf: 'center',
    position: 'relative',
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarPreviewCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#DCECF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
  },
  avatarPreviewText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    color: Colors.teal,
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarViewerOverlay: {
    flex: 1,
    backgroundColor: '#081824',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarViewerClose: {
    position: 'absolute',
    top: 42,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatarViewerCloseText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
  },
  avatarViewerImage: {
    width: '100%',
    height: '100%',
  },
  avatarOptionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,24,36,0.38)',
    justifyContent: 'flex-end',
    padding: 18,
  },
  avatarOptionSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 2,
  },
  avatarOptionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  avatarOptionBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  avatarOptionBtnBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarOptionText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.teal,
  },
  avatarOptionCancel: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#F4F8FB',
  },
  avatarOptionCancelText: {
    color: Colors.textSecondary,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  labelTopSpacing: { marginTop: 24 },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textPrimary,
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ageChipActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.teal,
  },
  ageChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ageChipTextActive: {
    color: Colors.textLight,
  },
  error: {
    color: Colors.alertHigh,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.textLight,
  },
});

export const profileFeedbackPageStyles = StyleSheet.create({
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  labelTopSpacing: { marginTop: 24 },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  starBtn: {
    padding: 4,
  },
  star: {
    fontSize: 32,
    color: Colors.border,
  },
  starActive: {
    color: '#F5B94A',
  },
  textarea: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textPrimary,
    minHeight: 140,
  },
  error: {
    color: Colors.alertHigh,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.textLight,
  },
});

export const profileHelpPageStyles = StyleSheet.create({
  item: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  qRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  q: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    paddingRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: Colors.teal,
    fontFamily: 'Nunito_700Bold',
    width: 20,
    textAlign: 'center',
  },
  a: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
});

export const profileLanguagePageStyles = StyleSheet.create({
  note: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowBody: { flex: 1 },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  sub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    fontSize: 20,
    color: Colors.teal,
    fontFamily: 'Nunito_700Bold',
  },
});

export const profileSecurityPageStyles = StyleSheet.create({
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  labelTopSpacing: { marginTop: 20 },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textPrimary,
  },
  error: {
    color: Colors.alertHigh,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.textLight,
  },
});

export const profileTermsPageStyles = StyleSheet.create({
  section: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.muted,
    marginTop: 28,
    fontStyle: 'italic',
  },
});

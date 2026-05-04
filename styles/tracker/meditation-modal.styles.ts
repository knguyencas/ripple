import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const MEDITATE_GREEN = '#3D7A4A';
const MEDITATE_BG = '#D8E8D8';
const MEDITATE_BORDER = '#C8DCC8';
const MEDITATE_TRACK = '#E8F0E8';

export const MeditateAccent = {
  green: MEDITATE_GREEN,
  bg: MEDITATE_BG,
  border: MEDITATE_BORDER,
  track: MEDITATE_TRACK,
};

export const meditationModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 44, 58, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.foam,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 26,
    shadowColor: '#1A3A4A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 22,
  },

  sectionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 12,
  },

  soundsScroll: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  soundCard: {
    width: 124,
    minHeight: 126,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1A3A4A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  soundCardActive: {
    borderColor: MEDITATE_GREEN,
    backgroundColor: MEDITATE_BG,
  },
  soundName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  soundDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  soundStatus: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: MEDITATE_TRACK,
  },
  soundStatusText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: MEDITATE_GREEN,
  },
  soundStatusInactive: {
    backgroundColor: '#EEF4F8',
  },
  soundStatusInactiveText: {
    color: Colors.textSecondary,
  },
  soundProgressBar: {
    marginTop: 6,
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: MEDITATE_TRACK,
    overflow: 'hidden',
  },
  soundProgressFill: {
    height: '100%',
    backgroundColor: MEDITATE_GREEN,
    borderRadius: 2,
  },
  soundDownloadBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  durationRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
  },
  durationChip: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipActive: {
    backgroundColor: MEDITATE_GREEN,
    borderColor: MEDITATE_GREEN,
  },
  durationChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  durationChipTextActive: {
    color: '#FFFFFF',
  },

  hero: {
    marginTop: 24,
    marginHorizontal: 4,
    backgroundColor: MEDITATE_BG,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: MEDITATE_BORDER,
  },
  heroCountdown: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 44,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  heroSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  actions: {
    marginTop: 24,
    gap: 12,
  },
  downloadToast: {
    backgroundColor: '#FFF7DA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2D58A',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  downloadToastText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: MEDITATE_GREEN,
    borderRadius: 24,
    minHeight: 52,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MEDITATE_GREEN,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5,
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  primaryBtnDisabled: {
    backgroundColor: '#9CC0A2',
    shadowOpacity: 0.1,
  },
  secondaryBtn: {
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
  },

  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 32,
    paddingHorizontal: 28,
    lineHeight: 19,
  },
  catalogLoading: {
    marginVertical: 16,
  },
});

export const meditationAwayDialogStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 44, 58, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.foam,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#1A3A4A',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  bodyBold: {
    fontFamily: 'Nunito_700Bold',
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionsStack: {
    gap: 12,
    width: '100%',
  },
  stackBtn: {
    width: '100%',
    minHeight: 48,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  stackPrimaryBtn: {
    backgroundColor: MEDITATE_GREEN,
  },
  stackSecondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  endBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  endText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resumeBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: MEDITATE_GREEN,
    alignItems: 'center',
  },
  resumeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  dangerBtn: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dangerText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: '#B14A4A',
  },
});

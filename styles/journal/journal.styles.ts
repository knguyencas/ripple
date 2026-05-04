import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = Math.min(108, Math.floor((width - 84) / 3));

export const J = {
  bg:          '#F4F8FB',
  illustBg:   '#DCECF5',
  card:        '#FFFFFF',
  textPrimary: '#1A3A5C',
  textMuted:   '#4A7A9B',
  textLight:   '#7FB3CC',
  placeholder: '#9FC4D8',
  accent:      '#2E6F8E',
  deleteRed:   '#C0392B',
  border:      '#DDEAF1',
  micBg:       '#2E6F8E',
  micActive:   '#C0392B',
  divider:     '#DDEAF1',
  btnBg:       '#2E6F8E',
  btnText:     '#FFFFFF',
};

export const journalCardShadow: any = Platform.OS === 'web'
  ? { boxShadow: '0 2px 8px rgba(26,58,74,0.08)' }
  : { shadowColor: '#1A3A4A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 };

export const journalHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBtn:     { padding: 6, minWidth: 36, alignItems: 'center' },
  headerBtnText: { fontSize: 26, color: J.textPrimary, fontFamily: 'Nunito_600SemiBold', lineHeight: 30 },
  headerDate: {
    flex: 1, textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: J.textPrimary,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saveBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: J.accent, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnOff:  { backgroundColor: J.border },
  saveBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 17 },
  editBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: J.border, alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { fontSize: 16 },
});

export const journalToastStyles = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 112, left: 20, right: 20, zIndex: 9999,
    backgroundColor: J.textPrimary, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 20,
    ...journalCardShadow,
  },
  toastIcon:  { fontSize: 22 },
  toastTitle: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
  toastSub:   { fontFamily: 'Nunito_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
});

export const journalNewStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: J.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  bottomSpacer: { height: 128 },
});

export const journalDetailStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: J.bg },
  loadingIndicator: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, gap: 14 },
  card: {
    backgroundColor: J.card, borderRadius: 20, padding: 18, ...journalCardShadow,
  },
  cardTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: J.textPrimary, marginBottom: 12 },
  moodRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moodEmoji: { fontSize: 36 },
  moodName:  { fontFamily: 'Nunito_700Bold', fontSize: 15, color: J.textPrimary },
  moodDesc:  { fontFamily: 'Nunito_400Regular', fontSize: 12, color: J.textMuted, marginTop: 2 },
  noteText:  { fontFamily: 'Nunito_400Regular', fontSize: 14, color: J.textMuted, lineHeight: 22 },
  noteEmpty: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: J.placeholder, fontStyle: 'italic' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrap:  { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 12, overflow: 'hidden' },
  photo:      { width: '100%', height: '100%' },
  imageViewerOverlay: { flex: 1, backgroundColor: '#081824' },
  imageViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8,24,36,0.72)',
  },
  imageViewerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  imageViewerCounter: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#FFFFFF' },
  imageViewerSlide: { alignItems: 'center', justifyContent: 'center' },
  imageViewerImage: { width: '100%', height: '100%' },
  imageViewerNav: {
    position: 'absolute',
    top: '50%',
    zIndex: 2,
    width: 42,
    height: 42,
    marginTop: -21,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  imageViewerNavLeft: { left: 14 },
  imageViewerNavRight: { right: 14 },
  imageViewerNavDisabled: { opacity: 0.28 },
  audioRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF7FB', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    gap: 10, marginBottom: 6,
  },
  audioRowActive: { backgroundColor: '#DCEFF7' },
  audioPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: J.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayBtnLoading: { opacity: 0.7 },
  audioPlayIcon: { fontSize: 16 },
  audioLabel: { flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: J.textPrimary },
  nlpCard: { backgroundColor: '#EEF7FB' },
  nlpRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: J.border,
  },
  nlpLabel: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: J.textMuted },
  nlpValue: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: J.textPrimary },
  flex1: { flex: 1 },
  bottomSpacer: { height: 128 },
  deleteIcon: { color: J.deleteRed, fontSize: 20 },
  alertValue: { color: J.deleteRed },
});

export const journalIndexStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: J.bg },
  loadingIndicator: { flex: 1 },
  illustWrap: {
    backgroundColor: J.illustBg,
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  illustPlaceholder: { width: '100%', height: 200 },
  illustHero: {
    width: '100%',
    height: 178,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  illustImg: { width: '100%', height: 200, resizeMode: 'contain' },
  pageTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: J.textPrimary,
    marginTop: 2,
    marginBottom: 8,
  },
  actionSection: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  actionCard: {
    backgroundColor: J.card,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...journalCardShadow,
  },
  actionCardLeft: { flex: 1, gap: 12 },
  actionCardTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: J.textPrimary,
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: J.btnBg,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  actionBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#FFFFFF' },
  actionChevron: { fontSize: 24, color: J.placeholder, marginLeft: 8 },
  monthSection: { paddingHorizontal: 16, paddingTop: 28 },
  monthTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: J.textPrimary,
    marginBottom: 12,
  },
  entryRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'flex-start',
    gap: 14,
  },
  entryRowBorder: { borderBottomWidth: 1, borderBottomColor: J.divider },
  entryRowToday: {
    backgroundColor: '#EEF7FB',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  dateCol: { width: 36, alignItems: 'center', paddingTop: 2 },
  dateWeekday: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: J.textMuted,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: J.textPrimary,
    lineHeight: 26,
  },
  entryContent: { flex: 1 },
  entryText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: J.textMuted,
    lineHeight: 20,
  },
  entryEmpty: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: J.textLight,
    fontStyle: 'italic',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: J.textPrimary },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: J.textMuted,
    textAlign: 'center',
  },
  bottomSpacer: { height: 128 },
});

export const journalFormStyles = StyleSheet.create({
  container: { gap: 14 },
  card:      { backgroundColor: J.card, borderRadius: 20, padding: 18, ...journalCardShadow },
  cardTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: J.textPrimary, marginBottom: 12 },

  moodCard:   { paddingVertical: 14 },
  moodRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moodEmoji:  { fontSize: 36 },
  moodName:   { fontFamily: 'Nunito_700Bold', fontSize: 15, color: J.textPrimary },
  moodDesc:   { fontFamily: 'Nunito_400Regular', fontSize: 12, color: J.textMuted, marginTop: 2 },
  moodChange: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: J.accent },
  moodChevron:{ fontSize: 22, color: J.placeholder },
  moodTextWrap: { flex: 1 },

  textInput: {
    fontFamily: 'Nunito_400Regular', fontSize: 14, color: J.textPrimary,
    minHeight: 120, lineHeight: 22,
  },
  charCount: {
    fontFamily: 'Nunito_400Regular', fontSize: 11,
    color: J.placeholder, textAlign: 'right', marginTop: 6,
  },

  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrap:  { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 12, overflow: 'hidden' },
  photo:      { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  photoAdd: {
    width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 12,
    backgroundColor: J.bg, borderWidth: 1.5, borderColor: J.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoAddIcon:  { fontSize: 22 },
  photoAddLabel: { fontFamily: 'Nunito_400Regular', fontSize: 10, color: J.textMuted },

  audioList: { gap: 8, marginBottom: 14 },
  audioRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF7FB', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12, gap: 10,
  },
  audioPlayBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: J.accent, alignItems: 'center', justifyContent: 'center',
  },
  audioPlayIcon: { color: '#fff', fontSize: 12 },
  audioLabel:    { flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: J.textPrimary },
  audioDeleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FADBD8', alignItems: 'center', justifyContent: 'center',
  },
  audioDeleteIcon: { color: J.deleteRed, fontSize: 18, lineHeight: 22 },

  voiceWrap: { alignItems: 'center', paddingTop: 4, gap: 10 },
  micBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: J.micBg, alignItems: 'center', justifyContent: 'center', ...journalCardShadow,
  },
  micBtnActive: {
    backgroundColor: J.micActive,
    shadowColor: J.micActive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  voiceHint: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: J.textMuted },
  voiceHintActive: { color: J.micActive, fontFamily: 'Nunito_600SemiBold' },
});

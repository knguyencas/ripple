import { StyleSheet } from 'react-native';

const TEXT = '#1A3A5C';
const MUTED = '#6E8597';
const BLUE_DARK = '#2E6F8E';
const BLUE_LIGHT = '#C4DDED';
const STREAK = '#D85A30';
const STREAK_SOFT = '#FFF0DC';
const STREAK_SOFT_BORDER = '#FFE0B8';
const STREAK_CARD = '#E8F0F7';
const YELLOW_BG = '#FFF3CD';
const YELLOW_TEXT = '#8B6F2A';
const YELLOW_TITLE = '#5A4216';

export const trackerHeaderRedesignStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4C28E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#6B4226',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: TEXT,
  },
  dateText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: BLUE_LIGHT,
  },
  streakIcon: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: STREAK,
  },
  streakNum: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 19,
    color: STREAK,
    textAlignVertical: 'center',
  },
  affirm: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    color: TEXT,
    lineHeight: 23,
    marginTop: 14,
  },
});

export const heroProgressStyles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: BLUE_LIGHT,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#1A3A4A',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  pctBlock: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pctTrack: {
    position: 'absolute',
    inset: 0,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(46, 111, 142, 0.22)',
  },
  pctLeftClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 35,
    height: 70,
    overflow: 'hidden',
  },
  pctRightClip: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 35,
    height: 70,
    overflow: 'hidden',
  },
  pctProgressHalf: {
    position: 'absolute',
    top: 0,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: BLUE_DARK,
  },
  pctProgressRight: {
    right: 0,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  pctProgressLeft: {
    left: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pctContent: {
    position: 'absolute',
    inset: 7,
    borderRadius: 28,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: TEXT,
    lineHeight: 20,
  },
  pctSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 8,
    color: BLUE_DARK,
    marginTop: 1,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  bodyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: TEXT,
    lineHeight: 21,
  },
  bodyProgressTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(46, 111, 142, 0.18)',
    marginTop: 8,
    overflow: 'hidden',
  },
  bodyProgressFill: {
    height: '100%',
    backgroundColor: BLUE_DARK,
    borderRadius: 3,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: BLUE_DARK,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});

export const trackerIconsRowStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: TEXT,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    borderRadius: 16,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#1A3A4A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cellActive: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 10,
  },
  cellGlyphBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellGlyph: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
  cellLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export const streaksCardStyles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: STREAK_CARD,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#1A3A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: TEXT,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#B5CDD9',
    borderStyle: 'dashed',
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  monthBlock: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: STREAK_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BLUE_DARK,
  },
  flame: {
    fontSize: 25,
    lineHeight: 28,
  },
  flameMuted: {
    opacity: 0.35,
  },
  body: {
    flex: 1,
  },
  bodyTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: TEXT,
  },
  bodyDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: MUTED,
    marginTop: 5,
    lineHeight: 17,
  },
});

export const yellowReminderStyles = StyleSheet.create({
  ctaCard: {
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: YELLOW_BG,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#B07F1A',
    shadowOffset: { width: -7, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 5,
  },
  ctaBody: {
    flex: 1,
    minWidth: 0,
  },
  ctaText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: YELLOW_TEXT,
    lineHeight: 19,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: YELLOW_TITLE,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: YELLOW_BG,
  },
  ctaArrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: YELLOW_TEXT,
  },

  msgCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 0,
    backgroundColor: YELLOW_BG,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    shadowColor: '#B07F1A',
    shadowOffset: { width: -7, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 5,
  },
  msgMascot: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgMascotText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: BLUE_DARK,
  },
  msgBody: {
    flex: 1,
    minWidth: 0,
  },
  msgTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: YELLOW_TITLE,
  },
  msgText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: YELLOW_TEXT,
    lineHeight: 19,
    marginTop: 7,
  },
});

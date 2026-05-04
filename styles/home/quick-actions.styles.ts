import { StyleSheet } from 'react-native';

export const QuickActionAccent = {
  water:    { primary: '#2E6F8E', dark: '#5B9BC8', bg: '#DEEBFF', track: '#E8F0F7', soft: '#F0F4F7' },
  sleep:    { primary: '#6B5AAA', dark: '#6B5AAA', bg: '#E0D8F0', track: '#F0EBF7', soft: '#F4F0FA' },
  walk:     { primary: '#A0651A', dark: '#C97818', bg: '#F4D8B0', track: '#FAEDD8', soft: '#FAEDD8' },
  meditate: { primary: '#3D7A4A', dark: '#3D7A4A', bg: '#D8E8D8', track: '#E8F0E8', soft: '#E8F0E8' },
} as const;

export type QuickActionAccentName = keyof typeof QuickActionAccent;

export const quickActionStyles = StyleSheet.create({
  grid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 13,
    minHeight: 164,
    shadowColor: '#1A3A4A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 11,
    elevation: 8,
  },
  cardDashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 13,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#1A3A4A',
    flexShrink: 1,
  },
  badgeNew: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeNewText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 8,
    color: '#B07F1A',
  },
  goal: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: '#6E8597',
    marginTop: 3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  valueBig: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 25,
    lineHeight: 29,
  },
  valueUnit: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#6E8597',
    marginLeft: 4,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pillBtn: {
    flex: 1,
    borderRadius: 20,
    minHeight: 36,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
  },
  pillBtnPrimary: {
    flex: 2,
  },
  pillBtnDisabled: {
    opacity: 0.5,
  },
});

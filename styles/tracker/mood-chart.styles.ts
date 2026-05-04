import { StyleSheet } from 'react-native';

const MUTED = '#6E8597';

export const moodChartStyles = StyleSheet.create({
  chartWrap: {
    paddingTop: 8,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 170,
    gap: 4,
    paddingHorizontal: 2,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barColumn: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barBg: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 58, 74, 0.05)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  barFill: {
    width: '60%',
    alignSelf: 'center',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    alignItems: 'center',
    paddingTop: 6,
  },
  barEmpty: {
    width: '100%',
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  emojiBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  emojiText: {
    fontSize: 12,
    lineHeight: 14,
  },
  emojiTextEmpty: {
    fontSize: 12,
    color: MUTED,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: MUTED,
    marginTop: 6,
  },
});

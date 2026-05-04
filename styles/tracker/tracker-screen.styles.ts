import { StyleSheet } from 'react-native';

const SECTION_GAP = 22;

export const trackerScreenRedesignStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F8FB',
  },
  scrollContent: {
    paddingBottom: 104,
  },
  loading: {
    marginTop: 40,
  },
  calendarWrap: {
    marginTop: SECTION_GAP,
  },
  chartWrap: {
    marginTop: SECTION_GAP,
  },
  bottomSpacer: {
    height: 48,
  },
});

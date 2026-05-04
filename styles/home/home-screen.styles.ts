import { StyleSheet } from 'react-native';

const APP_BG = '#F4F8FB';
const DEEP_BLUE = '#1A3A5C';
const ACTION_BLUE = '#2E6F8E';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 128,
  },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#1A3A4A',
    marginTop: 26,
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  sectionRowTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: DEEP_BLUE,
  },
  sectionRowMeta: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: ACTION_BLUE,
    lineHeight: 18,
    paddingBottom: 2,
  },
});

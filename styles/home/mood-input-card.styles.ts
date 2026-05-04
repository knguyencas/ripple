import { StyleSheet } from 'react-native';

export const moodInputCardStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  prompt: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#1A3A4A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#1A3A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  halo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(244, 166, 160, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloLogged: {
    backgroundColor: 'rgba(124, 179, 212, 0.18)',
  },
  heartCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4A6A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartCoreLogged: {
    backgroundColor: '#5B9BC8',
  },
  heartGlyph: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#1A3A4A',
    marginTop: 12,
  },
  sub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#6E8597',
    marginTop: 4,
  },
  loggedNote: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#4A7A9B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
});

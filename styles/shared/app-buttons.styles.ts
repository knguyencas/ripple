import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const appBackButtonStyles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#1A3A4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    color: Colors.textPrimary,
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    lineHeight: 26,
  },
});

export const appIconButtonStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
});

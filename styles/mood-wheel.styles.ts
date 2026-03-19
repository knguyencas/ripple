import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export const moodWheelStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 39, 68, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: Colors.foam,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    paddingBottom: 48,
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  moodEmojiBig: {
    fontSize: 64,
    marginBottom: 4,
  },
  moodName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  moodDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#7FB3CC',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 32,
  },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: '#9BB5C4',
    marginTop: 8,
    marginBottom: 16,
  },
  confirmBtn: {
    backgroundColor: Colors.ocean,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    width: width - 48,
  },
  confirmBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textLight,
  },
  skipBtn: {
    marginTop: 10,
    padding: 8,
  },
  skipText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#9BB5C4',
    textDecorationLine: 'underline',
  },
});
import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { TIME_PICKER_ITEM_HEIGHT } from '../../constants/profile/time-picker.constants';

const BLUE = '#2E6F8E';
const CARD = '#FFFFFF';
const SOFT = '#EEF7FB';
const BORDER = '#D6E1E8';

export const sleepManualModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 44, 58, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#1A3A4A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  permissionCard: {
    backgroundColor: SOFT,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  permissionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  permissionButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  permissionButtonDisabled: {
    opacity: 0.64,
  },
  permissionButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    lineHeight: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    flexShrink: 1,
  },
  manualTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  pickerGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  timeGroup: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  timeLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  timeColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  wheelWrap: {
    width: 48,
    height: TIME_PICKER_ITEM_HEIGHT * 3,
    overflow: 'hidden',
    position: 'relative',
  },
  selector: {
    position: 'absolute',
    top: TIME_PICKER_ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: TIME_PICKER_ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BLUE,
    zIndex: 1,
  },
  item: {
    height: TIME_PICKER_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 17,
    color: Colors.muted,
  },
  itemTextActive: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: BLUE,
  },
  colon: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    paddingHorizontal: 1,
  },
  listSpacer: {
    height: TIME_PICKER_ITEM_HEIGHT,
  },
  durationPreview: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
  },
  errorText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.alertHigh,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#EEF4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.64,
  },
  saveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

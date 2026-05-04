import { StyleSheet } from 'react-native';

const TEXT = '#1A3A4A';
const MUTED = '#6E8597';
const BORDER = 'rgba(26, 58, 74, 0.08)';

export const activityPanelStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#1A3A4A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: TEXT,
  },
  closeBtn: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: MUTED,
  },

  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodChipActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1A3A4A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  periodChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: MUTED,
  },
  periodChipTextActive: {
    color: TEXT,
  },

  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  visualIconWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualIconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualText: {
    flex: 1,
    minWidth: 0,
  },
  metricBig: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: TEXT,
    lineHeight: 30,
  },
  metricUnit: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  metricCaption: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: MUTED,
    marginTop: 6,
    lineHeight: 15,
  },

  barChartWrap: {
    paddingTop: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    gap: 4,
    paddingHorizontal: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    height: '100%',
  },
  barTrack: {
    width: '100%',
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(26, 58, 74, 0.06)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 8,
    color: MUTED,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 8,
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  permissionBlock: {
    backgroundColor: '#EEF7FB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  permissionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: TEXT,
    lineHeight: 19,
    marginBottom: 5,
  },
  permissionText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
    marginBottom: 12,
  },
  permissionActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  permissionPrimary: {
    flex: 1,
    minHeight: 42,
    borderRadius: 20,
    backgroundColor: '#2E6F8E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  permissionPrimaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    flexShrink: 1,
  },
  permissionSecondary: {
    flex: 1,
    minHeight: 42,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  permissionSecondaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    lineHeight: 14,
    color: '#2E6F8E',
    textAlign: 'center',
    includeFontPadding: false,
    flexShrink: 1,
  },
});

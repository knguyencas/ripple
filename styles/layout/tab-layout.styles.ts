import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const tabLayoutStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 9,
    paddingTop: 8,
    height: 72,
    overflow: 'visible',
    shadowOpacity: 0,
    elevation: 0,
  },
  tabBarHidden: {
    display: 'none',
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  tabBarSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 24,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  tabBarTopRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 32,
    flexDirection: 'row',
  },
  tabBarTopSide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBarTopLeft: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 20,
  },
  tabBarTopRight: {
    borderTopRightRadius: 22,
    borderTopLeftRadius: 20,
  },
  tabBarTopGap: {
    width: 68,
    backgroundColor: 'transparent',
  },
  tabItem: {
    height: 60,
  },
  tabLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    marginTop: 1,
  },
  iconWrap: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  iconWrapActive: {
    backgroundColor: 'transparent',
  },
  iconText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.muted,
  },
  iconTextActive: {
    color: Colors.teal,
  },
  soraTabItem: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  soraOuter: {
    width: 82,
    height: 82,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -54,
    transform: [{ scaleX: 1.1 }, { scaleY: 1.03 }],
  },
  soraOuterActive: {},
  soraBody: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderTopLeftRadius: 9,
    backgroundColor: '#5B9BC8',
    transform: [{ rotate: '45deg' }],
  },
  soraBodyActive: {
    backgroundColor: '#4F91C0',
  },
  soraFace: {
    position: 'absolute',
    left: 13,
    right: 13,
    top: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  soraEye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A3A4A',
  },
  soraMouth: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1A3A4A',
  },
});

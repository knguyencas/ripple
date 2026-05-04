import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { tabLayoutStyles as styles } from '../../styles/layout/tab-layout.styles';
import { Sora } from '../../components/shared/Sora';

type TabGlyphName = 'home' | 'track' | 'journal' | 'profile';

const TAB_ICON_ACTIVE = '#2E6F8E';
const TAB_ICON_INACTIVE = '#C4DDED';

interface TabIconProps {
  name: TabGlyphName;
  focused: boolean;
}

function TabGlyph({ name, color }: { name: TabGlyphName; color: string }) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'home') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M4 10.4 12 4l8 6.4" {...strokeProps} />
        <Path d="M6.5 9.3V20h11V9.3" {...strokeProps} />
        <Path d="M10 20v-5h4v5" {...strokeProps} />
      </Svg>
    );
  }

  if (name === 'track') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Polyline points="4,16 9,11 13,14 20,6" {...strokeProps} />
        <Circle cx={4} cy={16} r={1.4} fill={color} />
        <Circle cx={9} cy={11} r={1.4} fill={color} />
        <Circle cx={13} cy={14} r={1.4} fill={color} />
        <Circle cx={20} cy={6} r={1.4} fill={color} />
      </Svg>
    );
  }

  if (name === 'journal') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x={6} y={4} width={12} height={16} rx={2.4} {...strokeProps} />
        <Line x1={9} y1={9} x2={15} y2={9} {...strokeProps} />
        <Line x1={9} y1={13} x2={15} y2={13} {...strokeProps} />
        <Line x1={9} y1={17} x2={13} y2={17} {...strokeProps} />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.4} {...strokeProps} />
      <Path d="M5.5 20c.75-4.1 3.05-6.2 6.5-6.2s5.75 2.1 6.5 6.2" {...strokeProps} />
    </Svg>
  );
}

function TabIcon({ name, focused }: TabIconProps) {
  const color = focused ? TAB_ICON_ACTIVE : TAB_ICON_INACTIVE;

  return (
    <View style={styles.iconWrap}>
      <TabGlyph name={name} color={color} />
    </View>
  );
}

function SoraTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.soraOuter, focused && styles.soraOuterActive]}>
      <Sora size={62} pose="idle" idPrefix="tab-sora" />
    </View>
  );
}

function TabBarBackground() {
  return (
    <View style={styles.tabBarBackground}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 84"
        preserveAspectRatio="none"
        style={styles.tabBarSvg}
      >
        <Path
          d="M0 24C0 10.8 10.8 0 24 0H143C155 0 160.5 9.5 164.5 23.5C169.7 41.5 181.5 50 195 50C208.5 50 220.3 41.5 225.5 23.5C229.5 9.5 235 0 247 0H366C379.2 0 390 10.8 390 24V84H0V24Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: TAB_ICON_ACTIVE,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Track',
          tabBarIcon: ({ focused }) => <TabIcon name="track" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Sora',
          tabBarIcon: ({ focused }) => <SoraTabIcon focused={focused} />,
          tabBarLabel: () => null,
          tabBarItemStyle: styles.soraTabItem,
          tabBarStyle: styles.tabBarHidden,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Nhật ký',
          tabBarIcon: ({ focused }) => <TabIcon name="journal" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

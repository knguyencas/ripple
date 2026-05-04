import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { authBackdropStyles as styles } from '../../styles/auth/auth-backdrop.styles';

export default function AuthBackdrop() {
  return (
    <View pointerEvents="none" style={styles.fill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="authTopGlow" cx="86%" cy="4%" r="82%">
            <Stop offset="0%" stopColor="#C8EEF4" stopOpacity={0.78} />
            <Stop offset="46%" stopColor="#DFF4F8" stopOpacity={0.48} />
            <Stop offset="76%" stopColor="#F4F8FB" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#F4F8FB" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="390" height="844" fill="url(#authTopGlow)" />
      </Svg>
    </View>
  );
}

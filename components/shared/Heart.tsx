import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { heartStyles as styles } from '../../styles/shared/heart.styles';

interface HeartProps {
  size?: number;
  withHalo?: boolean;
  idPrefix?: string;
  style?: ViewStyle;
}

let heartCounter = 0;

export function Heart({ size = 60, withHalo = true, idPrefix, style }: HeartProps) {
  const uniqueId = React.useMemo(() => {
    if (idPrefix) return idPrefix;
    heartCounter += 1;
    return `heart-${heartCounter}`;
  }, [idPrefix]);
  const gradientId = `${uniqueId}-grad`;
  const haloSize = size + 20;

  const heartSvg = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={gradientId} cx="32%" cy="28%" r="75%">
          <Stop offset="0%" stopColor="#FFD4D0" />
          <Stop offset="55%" stopColor="#F4A6A0" />
          <Stop offset="100%" stopColor="#E07F84" />
        </RadialGradient>
      </Defs>
      <Path
        d="M 50 88 C 50 88, 5 60, 5 32 A 21 21 0 0 1 50 32 A 21 21 0 0 1 95 32 C 95 60, 50 88, 50 88 Z"
        fill={`url(#${gradientId})`}
      />
      <Ellipse cx={30} cy={32} rx={9} ry={6} fill="#FFFFFF" opacity={0.45} />
    </Svg>
  );

  if (!withHalo) {
    return <View style={style}>{heartSvg}</View>;
  }

  return (
    <View
      style={[
        styles.haloWrap,
        { width: haloSize, height: haloSize },
        style,
      ]}
    >
      <View
        style={[
          styles.haloBg,
          { width: haloSize, height: haloSize, borderRadius: haloSize / 2 },
        ]}
      />
      {heartSvg}
    </View>
  );
}

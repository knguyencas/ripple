import Svg, { Path } from 'react-native-svg';

interface BellIconProps {
  size?: number;
  color?: string;
}

export default function BellIcon({ size = 22, color = '#2E6F8E' }: BellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10.6C18 7.05 15.76 4.5 12 4.5S6 7.05 6 10.6v3.18c0 .55-.2 1.08-.56 1.49L4.4 16.45c-.56.63-.11 1.62.73 1.62h13.74c.84 0 1.29-.99.73-1.62l-1.04-1.18A2.25 2.25 0 0 1 18 13.78V10.6Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.75 19.2c.34.78 1.09 1.3 2.25 1.3s1.91-.52 2.25-1.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 3.35v1.1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

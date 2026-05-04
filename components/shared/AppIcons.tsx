import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function EditLineIcon({ size = 18, color = '#2E6F8E' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.7 18.55 5.5 14.8 15.95 4.35a2.05 2.05 0 0 1 2.9 0l.8.8a2.05 2.05 0 0 1 0 2.9L9.2 18.5l-3.75.8a.65.65 0 0 1-.75-.75Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m14.55 5.75 3.7 3.7"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TrashLineIcon({ size = 18, color = '#2E6F8E' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.4 7.2h13.2"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M9 7.2V5.8c0-.95.7-1.55 1.65-1.55h2.7C14.3 4.25 15 4.85 15 5.8v1.4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m8.15 9.9.45 7.25c.08 1.25.82 2.1 2.1 2.1h2.6c1.28 0 2.02-.85 2.1-2.1l.45-7.25"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.55 11.45v4.3M13.45 11.45v4.3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CheckLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5.2 12.65 4.15 4.15L18.9 7.2"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlayLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 5.7v12.6c0 .7.77 1.13 1.37.76l9.8-6.3a.9.9 0 0 0 0-1.52l-9.8-6.3a.9.9 0 0 0-1.37.76Z"
        fill={color}
      />
    </Svg>
  );
}

export function PauseLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8.3 5.6v12.8M15.7 5.6v12.8" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function CloseLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m7 7 10 10M17 7 7 17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronLeftLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m14.8 5.8-6 6.2 6 6.2" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9.2 5.8 6 6.2-6 6.2" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FireIcon({ size = 18, color = '#F4A261' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.8 2.9c.15 2.5-.92 4.03-2.22 5.42-1.5 1.6-3.3 3.15-3.3 6.1 0 3.68 2.6 6.28 6.08 6.28 3.58 0 6.36-2.62 6.36-6.48 0-3.32-2.06-5.7-4.08-7.64-.23 1.55-.9 2.75-2.03 3.54.18-2.62-.08-5.13-.8-7.22Z"
        fill={color}
      />
      <Path
        d="M12.05 20.55c-1.72-.5-2.75-1.8-2.75-3.5 0-1.42.78-2.48 1.72-3.38.78-.75 1.35-1.48 1.54-2.58 1.34 1.3 2.3 2.8 2.3 4.66 0 2.02-1.08 3.73-2.81 4.8Z"
        fill="#FFE0B8"
      />
    </Svg>
  );
}

export function DownloadLineIcon({ size = 18, color = '#2E6F8E' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4.8v9.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="m7.9 10.3 4.1 4.1 4.1-4.1"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.6 18.6h12.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CameraLineIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.4 7.4 8.8 5.6h6.4l1.4 1.8h2.1c1.1 0 1.9.8 1.9 1.9v8.1c0 1.1-.8 1.9-1.9 1.9H5.3c-1.1 0-1.9-.8-1.9-1.9V9.3c0-1.1.8-1.9 1.9-1.9h2.1Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.1a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function MicLineIcon({ size = 22, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 14.25c1.8 0 3.05-1.28 3.05-3.12V6.55c0-1.84-1.25-3.12-3.05-3.12S8.95 4.71 8.95 6.55v4.58c0 1.84 1.25 3.12 3.05 3.12Z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.95 10.85c0 3.45 2.42 5.88 6.05 5.88s6.05-2.43 6.05-5.88"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.75v3.1M8.85 19.85h6.3"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GoogleIcon({ size = 20 }: Pick<IconProps, 'size'>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.35 12.22c0-.74-.07-1.45-.2-2.12H12v4.02h5.24a4.47 4.47 0 0 1-1.94 2.93v2.6h3.15c1.84-1.7 2.9-4.2 2.9-7.43Z"
        fill="#4285F4"
      />
      <Path
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.15-2.6c-.87.58-1.98.92-3.3.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.68A9.74 9.74 0 0 0 12 21.7Z"
        fill="#34A853"
      />
      <Path
        d="M6.54 13.64a5.85 5.85 0 0 1 0-3.73V7.23H3.29a9.74 9.74 0 0 0 0 9.09l3.25-2.68Z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.88c1.43 0 2.72.49 3.73 1.45l2.79-2.79C16.83 2.96 14.63 2 12 2a9.74 9.74 0 0 0-8.71 5.23l3.25 2.68C7.31 7.6 9.46 5.88 12 5.88Z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function AppleIcon({ size = 20, color = '#1A3A5C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.9 12.73c-.02-2.02 1.66-2.99 1.74-3.04-.96-1.4-2.45-1.6-2.97-1.62-1.25-.13-2.45.74-3.08.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.66.8-3.37 2.04-1.44 2.49-.37 6.18 1.03 8.2.69 1 1.51 2.12 2.59 2.08 1.04-.04 1.43-.67 2.68-.67 1.25 0 1.6.67 2.7.65 1.12-.02 1.82-1.02 2.5-2.02.79-1.15 1.11-2.27 1.13-2.33-.03-.01-2.18-.84-2.2-3.33Z"
        fill={color}
      />
      <Path
        d="M15.08 5.88c.57-.69.96-1.65.85-2.61-.82.03-1.8.55-2.39 1.23-.52.6-.98 1.59-.86 2.52.92.07 1.83-.46 2.4-1.14Z"
        fill={color}
      />
    </Svg>
  );
}

export function MoodLineIcon({ size = 22, color = '#A03844' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.2a8.2 8.2 0 1 0 0-16.4 8.2 8.2 0 0 0 0 16.4Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M8.85 10.15h.01M15.15 10.15h.01"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M8.6 14.2c.78 1.22 1.92 1.85 3.4 1.85s2.62-.63 3.4-1.85"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function JournalLineIcon({ size = 22, color = '#8B6F2A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.1 4.3h9.8c1 0 1.75.75 1.75 1.75v11.9c0 1-.75 1.75-1.75 1.75H7.1c-1 0-1.75-.75-1.75-1.75V6.05c0-1 .75-1.75 1.75-1.75Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M8.35 4.3v15.4M10.95 8.1h4.35M10.95 11.4h4.35M10.95 14.7h2.75"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function WaterDropLineIcon({ size = 22, color = '#2E6F8E' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.6S6.8 9.15 6.8 13.2a5.2 5.2 0 0 0 10.4 0C17.2 9.15 12 3.6 12 3.6Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.45 13.65c.25 1.28 1.24 2.12 2.55 2.12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StepsLineIcon({ size = 22, color = '#A0651A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.45 4.35c1.2-.08 2.12.78 2.28 2.1.16 1.27-.35 3.1-1.38 3.45-1.03.35-2.32-.88-2.83-2.05-.55-1.27.34-3.4 1.93-3.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.3 11.45c1.88-.45 3.6.18 4.02 1.48.42 1.32-.6 2.75-2.28 3.2-1.68.45-3.4-.25-3.82-1.55-.42-1.3.2-2.68 2.08-3.13Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.7 8.2c1.1-.22 2.1.48 2.42 1.7.32 1.24-.02 3.05-.98 3.5-.96.45-2.35-.6-2.98-1.68-.68-1.16.08-3.24 1.54-3.52Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.8 15.05c1.75-.7 3.52-.32 4.12.88.62 1.22-.12 2.78-1.68 3.45-1.55.67-3.35.24-3.98-.97-.62-1.2-.2-2.66 1.54-3.36Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MeditationLineIcon({ size = 22, color = '#3D7A4A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 8.25a2.35 2.35 0 1 0 0-4.7 2.35 2.35 0 0 0 0 4.7Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M8.35 12.45c1.08-.82 2.3-1.22 3.65-1.22s2.57.4 3.65 1.22"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="m9.1 13.95-2.8 4.05M14.9 13.95l2.8 4.05"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M5.15 18.25c2.34-1.46 4.63-1.42 6.85.12 2.22-1.54 4.51-1.58 6.85-.12"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SleepLineIcon({ size = 22, color = '#6B5AAA' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.95 15.45a7.15 7.15 0 0 1-9.4-9.4 7.15 7.15 0 1 0 9.4 9.4Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.9 4.85h3.35l-3.55 4.1h3.75"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

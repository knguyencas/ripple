import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, G, Defs, ClipPath, Circle, Line, Rect } from 'react-native-svg';
import { soraStyles as styles } from '../../styles/shared/sora.styles';

export type SoraPose = 'idle' | 'wave' | 'hug';
export type SoraMoodExpression =
  | 'numb'
  | 'vague'
  | 'sad'
  | 'tired'
  | 'angry'
  | 'neutral'
  | 'calm'
  | 'okay'
  | 'positive'
  | 'happy'
  | 'excited';

interface SoraProps {
  size?: number;
  pose?: SoraPose;
  idPrefix?: string;
}

interface SoraInHaloProps extends SoraProps {
  haloSize?: number;
  haloColor?: string;
  withShadow?: boolean;
  style?: ViewStyle;
}

interface SoraMoodIconProps {
  size?: number;
  expression: SoraMoodExpression;
}

const BODY_PATH =
  'M 50 14 C 63 36, 76 54, 76 66 A 26 26 0 0 1 24 66 C 24 54, 37 36, 50 14 Z';
const HAND_LEFT_IDLE =
  'M 26 68 C 22 70, 20 76, 22 82 C 24 86, 28 85, 28 80 C 28 74, 27 70, 26 68 Z';
const HAND_RIGHT_IDLE =
  'M 74 68 C 78 70, 80 76, 78 82 C 76 86, 72 85, 72 80 C 72 74, 73 70, 74 68 Z';

const LEFT_ANCHOR = { x: 26, y: 68 };
const RIGHT_ANCHOR = { x: 74, y: 68 };
const BODY_COLOR = '#5B9BC8';
const SHADOW_COLOR = '#2E6F8E';
const FACE_COLOR = '#1A3A4A';

let soraCounter = 0;

export function Sora({ size = 60, pose = 'idle', idPrefix }: SoraProps) {
  const uniqueId = React.useMemo(() => {
    if (idPrefix) return idPrefix;
    soraCounter += 1;
    return `sora-${soraCounter}`;
  }, [idPrefix]);

  const clipId = `${uniqueId}-clip`;
  const leftRotation = pose === 'hug' ? 60 : 0;
  const rightRotation = pose === 'wave' ? -135 : pose === 'hug' ? -60 : 0;
  const leftTransform = `rotate(${leftRotation} ${LEFT_ANCHOR.x} ${LEFT_ANCHOR.y})`;
  const rightTransform = `rotate(${rightRotation} ${RIGHT_ANCHOR.x} ${RIGHT_ANCHOR.y})`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={BODY_PATH} />
        </ClipPath>
      </Defs>

      <Path d={BODY_PATH} fill={BODY_COLOR} />

      <G clipPath={`url(#${clipId})`}>
        <Path
          d={HAND_LEFT_IDLE}
          fill={SHADOW_COLOR}
          opacity={0.5}
          transform={`translate(0.7 1.3) ${leftTransform}`}
        />
        <Path
          d={HAND_RIGHT_IDLE}
          fill={SHADOW_COLOR}
          opacity={0.5}
          transform={`translate(0.7 1.3) ${rightTransform}`}
        />
      </G>

      <Path d={HAND_LEFT_IDLE} fill={BODY_COLOR} transform={leftTransform} />
      <Path d={HAND_RIGHT_IDLE} fill={BODY_COLOR} transform={rightTransform} />

      {pose === 'hug' && (
        <Path
          d="M50 92C50 92 38 85 38 78C38 74.1 40.8 71.8 44.2 71.8C46.6 71.8 48.5 73.1 50 75.1C51.5 73.1 53.4 71.8 55.8 71.8C59.2 71.8 62 74.1 62 78C62 85 50 92 50 92Z"
          fill="#F4A6A0"
        />
      )}

      <Circle cx={40} cy={68} r={3.6} fill={FACE_COLOR} />
      <Circle cx={60} cy={68} r={3.6} fill={FACE_COLOR} />
      <Line
        x1={44}
        y1={68}
        x2={56}
        y2={68}
        stroke={FACE_COLOR}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SoraInHalo({
  size = 38,
  pose = 'idle',
  haloSize,
  haloColor = '#C4DDED',
  withShadow = false,
  idPrefix,
  style,
}: SoraInHaloProps) {
  const computedHaloSize = haloSize ?? size + 14;

  return (
    <View
      style={[
        styles.halo,
        {
          width: computedHaloSize,
          height: computedHaloSize,
          borderRadius: computedHaloSize / 2,
          backgroundColor: haloColor,
        },
        withShadow && styles.haloShadow,
        style,
      ]}
    >
      <Sora size={size} pose={pose} idPrefix={idPrefix} />
    </View>
  );
}

export function SoraWithChecklist({ size = 150, idPrefix }: Pick<SoraProps, 'size' | 'idPrefix'>) {
  const uniqueId = React.useMemo(() => {
    if (idPrefix) return idPrefix;
    soraCounter += 1;
    return `sora-checklist-${soraCounter}`;
  }, [idPrefix]);

  const clipId = `${uniqueId}-clip`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={BODY_PATH} />
        </ClipPath>
      </Defs>

      <Path d={BODY_PATH} fill={BODY_COLOR} />

      <G clipPath={`url(#${clipId})`}>
        <Path
          d="M22 67 C16 69, 13.5 76, 17 81 C19.4 84.6, 24.5 83.3, 26.5 79.2 C28.8 74.5, 27.3 69, 22 67 Z"
          fill={SHADOW_COLOR}
          opacity={0.45}
        />
        <Path
          d="M78 67 C84 69, 86.5 76, 83 81 C80.6 84.6, 75.5 83.3, 73.5 79.2 C71.2 74.5, 72.7 69, 78 67 Z"
          fill={SHADOW_COLOR}
          opacity={0.45}
        />
      </G>

      <Circle cx={40} cy={50} r={3.4} fill={FACE_COLOR} />
      <Circle cx={60} cy={50} r={3.4} fill={FACE_COLOR} />
      <Line
        x1={44.5}
        y1={50}
        x2={55.5}
        y2={50}
        stroke={FACE_COLOR}
        strokeWidth={2}
        strokeLinecap="round"
      />

      <Rect x={22} y={58} width={56} height={31} rx={9} fill="#F7FBFE" />
      <Rect x={22} y={58} width={56} height={31} rx={9} stroke="#B9D8E8" strokeWidth={1.2} />
      <Path d="M38 56.5h24a4 4 0 0 1 4 4v1.8H34v-1.8a4 4 0 0 1 4-4Z" fill="#D7EAF4" />

      <Path
        d="m31 68.5 2.5 2.5 4.4-5"
        stroke="#2E6F8E"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1={44} y1={68.5} x2={66} y2={68.5} stroke="#6B8FA8" strokeWidth={2.2} strokeLinecap="round" />
      <Path
        d="m31 79 2.5 2.5 4.4-5"
        stroke="#2E6F8E"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1={44} y1={79} x2={61} y2={79} stroke="#6B8FA8" strokeWidth={2.2} strokeLinecap="round" />

      <Path
        d="M24 68 C18 70, 17.2 78, 21.5 81 C25.2 83.5, 30 80.2, 30 74 C30 70.5, 27.8 68.5, 24 68 Z"
        fill={BODY_COLOR}
      />
      <Path
        d="M76 68 C82 70, 82.8 78, 78.5 81 C74.8 83.5, 70 80.2, 70 74 C70 70.5, 72.2 68.5, 76 68 Z"
        fill={BODY_COLOR}
      />
    </Svg>
  );
}

function SoraMoodFace({ expression }: { expression: SoraMoodExpression }) {
  if (expression === 'numb') {
    return (
      <>
        <Circle cx={40} cy={66} r={2.6} fill={FACE_COLOR} opacity={0.62} />
        <Circle cx={60} cy={66} r={2.6} fill={FACE_COLOR} opacity={0.62} />
        <Line x1={43} y1={73} x2={57} y2={73} stroke={FACE_COLOR} strokeWidth={2} strokeLinecap="round" opacity={0.62} />
        <Circle cx={32} cy={55} r={2} fill="#D7EAF4" opacity={0.85} />
        <Circle cx={68} cy={58} r={1.7} fill="#D7EAF4" opacity={0.75} />
      </>
    );
  }

  if (expression === 'vague') {
    return (
      <>
        <Path d="M36 66h8M56 66h8" stroke={FACE_COLOR} strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
        <Line x1={44} y1={73} x2={56} y2={73} stroke={FACE_COLOR} strokeWidth={2} strokeLinecap="round" opacity={0.75} />
        <Path d="M30 52c3-3 6-3 9 0M61 52c3-3 6-3 9 0" stroke="#D7EAF4" strokeWidth={3} strokeLinecap="round" />
      </>
    );
  }

  if (expression === 'sad') {
    return (
      <>
        <Path d="M35 64c3-2 7-2 10 0M55 64c3-2 7-2 10 0" stroke={FACE_COLOR} strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M42 77c4-4 12-4 16 0" stroke={FACE_COLOR} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d="M33 70c-3 4-1 8 2 8s5-4 2-8l-2-3-2 3Z" fill="#D7EAF4" />
      </>
    );
  }

  if (expression === 'tired') {
    return (
      <>
        <Path d="M34 66c4 2 8 2 12 0M54 66c4 2 8 2 12 0" stroke={FACE_COLOR} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M45 75h10" stroke={FACE_COLOR} strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M67 52h8l-8 8h8" stroke="#D7EAF4" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  if (expression === 'angry') {
    return (
      <>
        <Path d="M34 60l11 4M66 60l-11 4" stroke={FACE_COLOR} strokeWidth={2.4} strokeLinecap="round" />
        <Circle cx={40} cy={68} r={3} fill={FACE_COLOR} />
        <Circle cx={60} cy={68} r={3} fill={FACE_COLOR} />
        <Path d="M43 78c4-3 10-3 14 0" stroke={FACE_COLOR} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (expression === 'neutral') {
    return (
      <>
        <Circle cx={40} cy={68} r={3.2} fill={FACE_COLOR} />
        <Circle cx={60} cy={68} r={3.2} fill={FACE_COLOR} />
        <Line x1={44} y1={75} x2={56} y2={75} stroke={FACE_COLOR} strokeWidth={2.2} strokeLinecap="round" />
      </>
    );
  }

  if (expression === 'calm') {
    return (
      <>
        <Path d="M34 66c4 3 8 3 12 0M54 66c4 3 8 3 12 0" stroke={FACE_COLOR} strokeWidth={2.3} strokeLinecap="round" fill="none" />
        <Path d="M41 75c4 5 14 5 18 0" stroke={FACE_COLOR} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (expression === 'okay') {
    return (
      <>
        <Circle cx={40} cy={67} r={3.2} fill={FACE_COLOR} />
        <Circle cx={60} cy={67} r={3.2} fill={FACE_COLOR} />
        <Path d="M42 74c4 4 12 4 16 0" stroke={FACE_COLOR} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (expression === 'positive') {
    return (
      <>
        <Path d="M35 65c3-3 7-3 10 0M55 65c3-3 7-3 10 0" stroke={FACE_COLOR} strokeWidth={2.3} strokeLinecap="round" fill="none" />
        <Path d="M39 73c5 6 17 6 22 0" stroke={FACE_COLOR} strokeWidth={2.8} strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (expression === 'happy') {
    return (
      <>
        <Circle cx={40} cy={66} r={3.4} fill={FACE_COLOR} />
        <Circle cx={60} cy={66} r={3.4} fill={FACE_COLOR} />
        <Path d="M38 73c5 8 19 8 24 0" stroke={FACE_COLOR} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={31} cy={72} r={2.8} fill="#F4A6A0" opacity={0.8} />
        <Circle cx={69} cy={72} r={2.8} fill="#F4A6A0" opacity={0.8} />
      </>
    );
  }

  if (expression === 'excited') {
    return (
      <>
        <Path d="M32 66l8-7 8 7M52 66l8-7 8 7" stroke={FACE_COLOR} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M38 73c5 8 19 8 24 0" stroke={FACE_COLOR} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={31} cy={72} r={2.8} fill="#F4A6A0" opacity={0.8} />
        <Circle cx={69} cy={72} r={2.8} fill="#F4A6A0" opacity={0.8} />
      </>
    );
  }

  return (
    <>
      <Path d="M34 65l3-4 3 4 3-4 3 4M54 65l3-4 3 4 3-4 3 4" stroke={FACE_COLOR} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M38 73c5 8 19 8 24 0" stroke={FACE_COLOR} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M28 56l3-7 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#D7EAF4" opacity={0.9} />
    </>
  );
}

export function SoraMoodIcon({ size = 40, expression }: SoraMoodIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={BODY_PATH} fill={BODY_COLOR} />
      <SoraMoodFace expression={expression} />
    </Svg>
  );
}

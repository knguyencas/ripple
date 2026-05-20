import { ReactNode } from 'react';
import { View, Text } from 'react-native';
import {
  quickActionStyles as s,
  QuickActionAccent,
  type QuickActionAccentName,
} from '../../styles/home/quick-actions.styles';

interface Props {
  title: string;
  goalLabel: string;
  accent: QuickActionAccentName;
  isNew?: boolean;
  dashed?: boolean;
  iconLetter?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function QuickActionCard({
  title,
  goalLabel,
  accent,
  isNew,
  dashed,
  iconLetter,
  icon,
  children,
}: Props) {
  const palette = QuickActionAccent[accent];

  return (
    <View
      style={[
        s.card,
        dashed && [s.cardDashed, { borderColor: palette.bg }],
      ]}
    >
      <View style={s.headerRow}>
        <View style={[s.iconBox, { backgroundColor: palette.bg }]}>
          {icon ?? (
            <Text style={[s.iconLetter, { color: palette.primary }]}>
              {iconLetter ?? title.slice(0, 1)}
            </Text>
          )}
        </View>
        <View style={s.titleBlock}>
          <View style={s.titleRow}>
            <Text style={s.title} numberOfLines={1}>{title}</Text>
            {isNew && (
              <View style={s.badgeNew}>
                <Text style={s.badgeNewText}>MỚI</Text>
              </View>
            )}
          </View>
          <Text style={s.goal} numberOfLines={1}>{goalLabel}</Text>
        </View>
      </View>

      {children}
    </View>
  );
}

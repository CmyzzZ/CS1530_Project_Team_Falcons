import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from './theme';

const VARIANTS = {
  selected: { bg: colors.selectedBg, fg: colors.selectedText, border: colors.selectedBg },
  unknown: { bg: colors.unknownBg, fg: colors.unknownText, border: colors.border, dashed: true },
  have: { bg: colors.haveBg, fg: colors.haveText, border: colors.haveBorder },
  missing: { bg: colors.missingBg, fg: colors.missingText, border: colors.missingBorder },
  option: { bg: colors.surface, fg: colors.text, border: colors.border },
};

// A small pill. When onPress is given it is tappable (e.g. tap to remove).
export default function IngredientTag({ label, variant = 'selected', onPress, accessibilityLabel, testID, trailing }) {
  const v = VARIANTS[variant];
  const style = [
    styles.tag,
    { backgroundColor: v.bg, borderColor: v.border, borderStyle: v.dashed ? 'dashed' : 'solid' },
  ];
  const content = (
    <Text style={[styles.label, { color: v.fg }]} numberOfLines={1}>
      {label}
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </Text>
  );

  if (!onPress) {
    return (
      <View style={style} testID={testID} accessibilityLabel={accessibilityLabel}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      hitSlop={4}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  trailing: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});

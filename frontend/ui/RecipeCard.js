import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import IngredientTag from './IngredientTag';
import { ingredientName } from './ingredients';
import { colors, radius } from './theme';

// One RecipeMatch from POST /search (US2 + US3).
export default function RecipeCard({ recipe }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const primary = language === 'zh' ? recipe.name_zh : recipe.name_en;
  const secondary = language === 'zh' ? recipe.name_en : recipe.name_zh;
  const percent = Math.round(recipe.match_ratio * 100);

  return (
    <View style={styles.card} testID={`recipe-${recipe.id}`}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{primary}</Text>
          <Text style={styles.subtitle}>{secondary}</Text>
        </View>
        <View style={[styles.badge, recipe.is_full_match ? styles.badgeFull : styles.badgePartial]}>
          <Text style={[styles.badgeText, { color: recipe.is_full_match ? colors.haveText : colors.missingText }]}>
            {recipe.is_full_match ? `✓ ${t('fullMatchBadge')}` : t('partialMatchBadge', { n: recipe.missing_count })}
          </Text>
        </View>
      </View>

      <Text style={styles.matchText}>
        {t('matchedCount', { matched: recipe.matched_count, total: recipe.total_ingredients })}
      </Text>
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%`, backgroundColor: recipe.is_full_match ? colors.haveText : colors.brand },
          ]}
        />
      </View>

      <Text style={styles.sectionLabel}>{t('youHave')}</Text>
      <View style={styles.tags}>
        {recipe.matched_ingredient_details.map((item) => (
          <IngredientTag key={item.id} variant="have" label={ingredientName(item, language)} />
        ))}
      </View>

      {recipe.missing_count > 0 ? (
        <>
          <Text style={[styles.sectionLabel, { color: colors.missingText }]}>
            {t('missing', { n: recipe.missing_count })}
          </Text>
          <View style={styles.tags}>
            {recipe.missing_ingredient_details.map((item) => (
              <IngredientTag
                key={item.id}
                variant="missing"
                label={ingredientName(item, language)}
                testID={`missing-${recipe.id}-${item.id}`}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleBlock: {
    flexShrink: 1,
    minWidth: 160,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeFull: {
    backgroundColor: colors.haveBg,
  },
  badgePartial: {
    backgroundColor: colors.missingBg,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  matchText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.progressTrack,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  sectionLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

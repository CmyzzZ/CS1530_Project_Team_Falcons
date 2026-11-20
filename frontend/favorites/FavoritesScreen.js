import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius } from '../ui/theme';

export default function FavoritesScreen({ favorites, onRemoveFavorite }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyBox} testID="favorites-empty">
        <Text style={styles.emptyTitle}>{t('favoritesEmptyTitle')}</Text>
        <Text style={styles.emptyText}>{t('favoritesEmptyHint')}</Text>
      </View>
    );
  }

  return (
    <View testID="favorites-list">
      <Text style={styles.summary}>{t('favoritesCount', { n: favorites.length })}</Text>
      {favorites.map((recipe) => {
        const primary = language === 'zh' ? recipe.name_zh : recipe.name_en;
        const secondary = language === 'zh' ? recipe.name_en : recipe.name_zh;

        return (
          <View key={recipe.id} style={styles.card} testID={`favorite-item-${recipe.id}`}>
            <View style={styles.info}>
              <Text style={styles.title}>{primary}</Text>
              <Text style={styles.subtitle}>{secondary}</Text>
              <Text style={styles.meta}>
                {t('favoriteIngredientCount', { n: recipe.total_ingredients ?? 0 })}
              </Text>
            </View>
            <Pressable
              onPress={() => onRemoveFavorite(recipe.id)}
              style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel={t('removeFavoriteLabel', { name: primary })}
              testID={`remove-favorite-${recipe.id}`}
            >
              <Text style={styles.removeButtonText}>{t('removeFavorite')}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  summary: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: colors.missingBorder,
    backgroundColor: colors.missingBg,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: colors.missingText,
    fontSize: 13,
    fontWeight: '700',
  },
});
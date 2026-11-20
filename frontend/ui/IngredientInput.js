import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import IngredientTag from './IngredientTag';
import { ingredientName, MAX_NAME_LENGTH, tagLabel } from './ingredients';
import { colors, radius } from './theme';

// react-native-web blurs single-line inputs on Enter unless told otherwise;
// native uses submitBehavior. Keeping focus lets users add several in a row.
const keepFocusProps = Platform.OS === 'web' ? { blurOnSubmit: false } : { submitBehavior: 'submit' };

const COMMON_LIMIT = 12;

// US1: type (English or Chinese) or pick ingredients; selected ones are
// shown as tags that are removed with a tap.
export default function IngredientInput({
  text,
  onChangeText,
  onSubmit,
  suggestions,
  onPickIngredient,
  tags,
  onRemoveTag,
  onClearAll,
  catalog,
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const selectedKeys = new Set(tags.map((tag) => tag.key));

  return (
    <View>
      <Text style={styles.label} nativeID="ingredient-input-label">
        {t('inputLabel')}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={t('inputPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={MAX_NAME_LENGTH * 4}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabelledBy="ingredient-input-label"
          accessibilityLabel={t('inputLabel')}
          testID="ingredient-input"
          {...keepFocusProps}
        />
        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          accessibilityRole="button"
          testID="add-ingredient"
        >
          <Text style={styles.addButtonText}>{t('add')}</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>{t('inputHint')}</Text>

      {suggestions.length > 0 ? (
        <View style={styles.suggestions} testID="suggestions">
          {suggestions.map((ingredient) => (
            <Pressable
              key={ingredient.id}
              onPress={() => onPickIngredient(ingredient)}
              style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
              accessibilityRole="button"
              testID={`suggestion-${ingredient.id}`}
            >
              <Text style={styles.suggestionText}>
                {ingredientName(ingredient, language)}
                <Text style={styles.suggestionAlt}>
                  {'  '}
                  {ingredientName(ingredient, language === 'zh' ? 'en' : 'zh')}
                </Text>
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {tags.length > 0 ? (
        <View style={styles.selectedBlock}>
          <View style={styles.tagRow} testID="selected-tags">
            {tags.map((tag) => {
              const label = tagLabel(tag, language);
              return (
                <IngredientTag
                  key={tag.key}
                  label={label}
                  trailing="  ×"
                  variant={tag.known ? 'selected' : 'unknown'}
                  onPress={() => onRemoveTag(tag.key)}
                  accessibilityLabel={t('removeTagLabel', { name: label })}
                  testID={`tag-${tag.key}`}
                />
              );
            })}
          </View>
          <View style={styles.selectedFooter}>
            <Text style={styles.hint}>{t('tapToRemove')}</Text>
            <Pressable onPress={onClearAll} accessibilityRole="button" testID="clear-all" hitSlop={6}>
              <Text style={styles.clearAll}>{t('clearAll')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {catalog.length > 0 ? (
        <View style={styles.commonBlock}>
          <Text style={styles.subLabel}>{t('commonIngredients')}</Text>
          <View style={styles.tagRow}>
            {catalog.slice(0, COMMON_LIMIT).map((ingredient) => {
              const selected = selectedKeys.has(ingredient.id);
              const label = ingredientName(ingredient, language);
              return (
                <IngredientTag
                  key={ingredient.id}
                  label={selected ? `✓ ${label}` : `+ ${label}`}
                  variant={selected ? 'selected' : 'option'}
                  onPress={() => (selected ? onRemoveTag(ingredient.id) : onPickIngredient(ingredient))}
                  accessibilityLabel={selected ? t('removeTagLabel', { name: label }) : label}
                  testID={`common-${ingredient.id}`}
                />
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    flexShrink: 1,
  },
  suggestions: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionPressed: {
    backgroundColor: colors.brandSoft,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.text,
  },
  suggestionAlt: {
    color: colors.textMuted,
  },
  selectedBlock: {
    marginTop: 14,
  },
  selectedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  clearAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
    marginTop: 6,
  },
  commonBlock: {
    marginTop: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

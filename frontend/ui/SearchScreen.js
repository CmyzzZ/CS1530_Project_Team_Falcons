import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL, fetchIngredients, searchRecipes } from '../api/client';
import IngredientInput from './IngredientInput';
import {
  addTags,
  buildAliasIndex,
  cleanName,
  makeTag,
  MAX_INGREDIENTS,
  removeTag,
  searchPayload,
  splitInput,
  suggestIngredients,
} from './ingredients';
import RecipeCard from './RecipeCard';
import { colors, radius } from './theme';

// Short pause so adding/removing several tags quickly sends one request.
export const SEARCH_DEBOUNCE_MS = 150;

function now() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
}

function errorMessage(error, t) {
  switch (error?.kind) {
    case 'network':
      return t('errorNetwork', { url: API_BASE_URL });
    case 'timeout':
      return t('errorTimeout');
    case 'unavailable':
      return t('errorUnavailable');
    default:
      return t('errorGeneric');
  }
}

export default function SearchScreen() {
  const { t, i18n } = useTranslation();

  const [catalog, setCatalog] = useState({ status: 'loading', items: [] });
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState({ status: 'idle', results: [], ms: 0, error: null });
  const latestSearch = useRef(0);

  const aliasIndex = useMemo(() => buildAliasIndex(catalog.items), [catalog.items]);
  const tagKeys = useMemo(() => tags.map((tag) => tag.key), [tags]);
  const suggestions = useMemo(
    () => (splitInput(text).length > 1 ? [] : suggestIngredients(text, catalog.items, tagKeys)),
    [text, catalog.items, tagKeys],
  );

  // GET /ingredients for autocomplete, alias resolution and the common list.
  useEffect(() => {
    const controller = new AbortController();
    setCatalog((previous) => ({ ...previous, status: 'loading' }));
    fetchIngredients({ signal: controller.signal })
      .then((items) => setCatalog({ status: 'ready', items }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCatalog({ status: 'error', items: [], error });
        }
      });
    return () => controller.abort();
  }, [catalogAttempt]);

  // Tags typed before the catalog loaded can now be resolved to real ingredients.
  useEffect(() => {
    if (aliasIndex.size === 0) {
      return;
    }
    setTags((current) => {
      if (!current.some((tag) => !tag.known && aliasIndex.has(cleanName(tag.text)))) {
        return current;
      }
      return addTags([], current.map((tag) => (tag.known ? tag : makeTag(tag.text, aliasIndex)))).tags;
    });
  }, [aliasIndex]);

  // POST /search whenever the selected ingredients change (US2 + US3).
  useEffect(() => {
    const searchId = latestSearch.current + 1;
    latestSearch.current = searchId;

    if (tags.length === 0) {
      setSearch({ status: 'idle', results: [], ms: 0, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setSearch((previous) => ({ ...previous, status: 'loading', error: null }));

    const timer = setTimeout(() => {
      const started = now();
      searchRecipes(searchPayload(tags), { signal: controller.signal })
        .then((results) => {
          if (latestSearch.current === searchId) {
            setSearch({ status: 'done', results, ms: Math.round(now() - started), error: null });
          }
        })
        .catch((error) => {
          if (latestSearch.current === searchId && !controller.signal.aborted) {
            setSearch({ status: 'error', results: [], ms: 0, error });
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [tags]);

  const applyNewTags = useCallback(
    (newTags) => {
      const outcome = addTags(tags, newTags);
      if (outcome.overflow > 0) {
        setNotice({ key: 'tooManyIngredients', params: { n: MAX_INGREDIENTS }, tone: 'warn' });
      } else if (outcome.added === 0 && outcome.duplicates > 0) {
        setNotice({ key: 'duplicateIngredient', tone: 'info' });
      } else if (newTags.some((tag) => tag && !tag.known)) {
        setNotice({ key: 'unknownIngredient', tone: 'warn' });
      } else {
        setNotice(null);
      }
      if (outcome.added > 0) {
        setTags(outcome.tags);
      }
    },
    [tags],
  );

  const handleSubmit = useCallback(() => {
    const parts = splitInput(text);
    if (parts.length === 0) {
      return;
    }
    let newTags = parts.map((part) => makeTag(part, aliasIndex));
    // A single partial word such as "tom" picks the top suggestion.
    if (parts.length === 1 && !newTags[0].known && suggestions.length > 0) {
      newTags = [makeTag(suggestions[0].id, aliasIndex)];
    }
    applyNewTags(newTags);
    setText('');
  }, [text, aliasIndex, suggestions, applyNewTags]);

  const handlePick = useCallback(
    (ingredient) => {
      applyNewTags([{ key: ingredient.id, value: ingredient.id, ingredient, known: true }]);
      setText('');
    },
    [applyNewTags],
  );

  const handleRemove = useCallback((key) => {
    setTags((current) => removeTag(current, key));
    setNotice(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setTags([]);
    setNotice(null);
  }, []);

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  }, [i18n]);

  const fullMatches = search.results.filter((recipe) => recipe.is_full_match);
  const partialMatches = search.results.filter((recipe) => !recipe.is_full_match);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title} accessibilityRole="header">
              {t('appTitle')}
            </Text>
            <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
          </View>
          <Pressable
            onPress={toggleLanguage}
            style={({ pressed }) => [styles.langButton, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={t('languageToggleLabel')}
            testID="language-toggle"
          >
            <Text style={styles.langButtonText}>{t('languageToggle')}</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <IngredientInput
            text={text}
            onChangeText={setText}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            onPickIngredient={handlePick}
            tags={tags}
            onRemoveTag={handleRemove}
            onClearAll={handleClearAll}
            catalog={catalog.items}
          />

          {notice ? (
            <Text style={[styles.notice, notice.tone === 'warn' && styles.noticeWarn]} testID="notice">
              {t(notice.key, notice.params)}
            </Text>
          ) : null}

          {catalog.status === 'loading' ? <ActivityIndicator style={styles.catalogSpinner} color={colors.brand} /> : null}
          {catalog.status === 'error' ? (
            <View style={styles.banner} testID="catalog-error">
              <Text style={styles.bannerText}>{t('catalogError')}</Text>
              <Pressable onPress={() => setCatalogAttempt((n) => n + 1)} accessibilityRole="button" hitSlop={6}>
                <Text style={styles.retry}>{t('retry')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.results} accessibilityLiveRegion="polite">
          {search.status === 'idle' ? <Text style={styles.empty}>{t('emptyPrompt')}</Text> : null}

          {search.status === 'loading' ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.brand} />
              <Text style={styles.loadingText}>{t('searching')}</Text>
            </View>
          ) : null}

          {search.status === 'error' ? (
            <View style={[styles.banner, styles.bannerError]} testID="search-error">
              <Text style={[styles.bannerText, { color: colors.missingText }]}>{errorMessage(search.error, t)}</Text>
            </View>
          ) : null}

          {search.status === 'done' ? (
            <>
              <Text style={styles.summary} testID="results-summary">
                {t('resultsSummary', { n: search.results.length, ms: search.ms })}
              </Text>
              {search.results.length === 0 ? <Text style={styles.empty}>{t('noResults')}</Text> : null}

              {fullMatches.length > 0 ? (
                <Text style={styles.groupTitle} accessibilityRole="header">
                  {t('fullMatches')}
                </Text>
              ) : null}
              {fullMatches.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}

              {partialMatches.length > 0 ? (
                <Text style={styles.groupTitle} accessibilityRole="header">
                  {t('partialMatches')}
                </Text>
              ) : null}
              {partialMatches.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.brand,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  langButton: {
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  langButtonText: {
    color: colors.brand,
    fontWeight: '700',
    fontSize: 14,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  notice: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  noticeWarn: {
    color: colors.warnText,
  },
  catalogSpinner: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  banner: {
    marginTop: 12,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.warnBg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bannerError: {
    backgroundColor: colors.missingBg,
  },
  bannerText: {
    flexShrink: 1,
    color: colors.warnText,
    fontSize: 14,
  },
  retry: {
    color: colors.brand,
    fontWeight: '700',
  },
  results: {
    marginTop: 20,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    color: colors.textMuted,
  },
  summary: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
});

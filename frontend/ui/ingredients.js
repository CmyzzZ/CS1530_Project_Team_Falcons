// Pure helpers for the ingredient input (US1).
// Kept free of React so they can be unit tested directly.

// Same limits as SearchRequest in backend/search_matching/routes.py.
export const MAX_INGREDIENTS = 50;
export const MAX_NAME_LENGTH = 80;

// Mirrors clean_name() in backend/search_matching/service.py:
// NFKC folds full-width characters, then lower-case and collapse whitespace.
export function cleanName(name) {
  return String(name ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

export function ingredientName(ingredient, language) {
  return language === 'zh' ? ingredient.name_zh : ingredient.name_en;
}

function namesOf(ingredient) {
  return [
    ingredient.id,
    ingredient.name_en,
    ingredient.name_zh,
    ...(ingredient.aliases ?? []),
  ];
}

// Map every cleaned id / English name / Chinese name / alias to its ingredient.
export function buildAliasIndex(ingredients) {
  const index = new Map();
  for (const ingredient of ingredients) {
    for (const name of namesOf(ingredient)) {
      const cleaned = cleanName(name);
      if (cleaned && !index.has(cleaned)) {
        index.set(cleaned, ingredient);
      }
    }
  }
  return index;
}

// Catalog entries whose names contain what the user has typed so far.
// Names that start with the query are listed first.
export function suggestIngredients(query, ingredients, selectedKeys = [], limit = 6) {
  const cleaned = cleanName(query);
  if (!cleaned) {
    return [];
  }

  const selected = new Set(selectedKeys);
  const prefix = [];
  const contains = [];

  for (const ingredient of ingredients) {
    if (selected.has(ingredient.id)) {
      continue;
    }
    const names = namesOf(ingredient).map(cleanName);
    if (names.some((name) => name.startsWith(cleaned))) {
      prefix.push(ingredient);
    } else if (names.some((name) => name.includes(cleaned))) {
      contains.push(ingredient);
    }
  }

  return [...prefix, ...contains].slice(0, limit);
}

// Users may type several ingredients at once: "tomato, egg，米饭、黄瓜".
export function splitInput(text) {
  return String(text ?? '')
    .split(/[,，、;；\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// A tag is either a known catalog ingredient or free text the catalog
// does not recognise (the backend will simply not match it).
export function makeTag(text, aliasIndex) {
  const cleaned = cleanName(text);
  if (!cleaned) {
    return null;
  }

  const ingredient = aliasIndex.get(cleaned);
  if (ingredient) {
    return { key: ingredient.id, value: ingredient.id, ingredient, known: true };
  }

  const raw = String(text).trim().slice(0, MAX_NAME_LENGTH);
  return { key: `raw:${cleaned}`, value: raw, text: raw, known: false };
}

// Returns { tags, added, duplicates, overflow } without mutating the input.
export function addTags(tags, newTags) {
  const next = [...tags];
  const keys = new Set(tags.map((tag) => tag.key));
  let added = 0;
  let duplicates = 0;
  let overflow = 0;

  for (const tag of newTags) {
    if (!tag) {
      continue;
    }
    if (keys.has(tag.key)) {
      duplicates += 1;
      continue;
    }
    if (next.length >= MAX_INGREDIENTS) {
      overflow += 1;
      continue;
    }
    keys.add(tag.key);
    next.push(tag);
    added += 1;
  }

  return { tags: next, added, duplicates, overflow };
}

export function removeTag(tags, key) {
  return tags.filter((tag) => tag.key !== key);
}

export function tagLabel(tag, language) {
  return tag.known ? ingredientName(tag.ingredient, language) : tag.text;
}

// What POST /search expects: ingredient ids for known tags, raw text otherwise.
export function searchPayload(tags) {
  return tags.map((tag) => tag.value);
}

let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const FAVORITES_KEY = 'falcons_favorite_recipes_v1';
let memoryFallback = [];

export async function loadFavorites() {
  try {
    if (!AsyncStorage) {
      return memoryFallback;
    }
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return memoryFallback;
  }
}

export async function saveFavorites(favorites) {
  memoryFallback = favorites;
  try {
    if (AsyncStorage) {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch {
    // Ignore storage errors in test environments without native storage.
  }
}

export function isFavorite(favorites, recipeId) {
  return favorites.some((item) => item.id === recipeId);
}

export function toggleFavoriteList(favorites, recipe) {
  if (isFavorite(favorites, recipe.id)) {
    return favorites.filter((item) => item.id !== recipe.id);
  }
  return [recipe, ...favorites];
}

export function removeFavoriteFromList(favorites, recipeId) {
  return favorites.filter((item) => item.id !== recipeId);
}
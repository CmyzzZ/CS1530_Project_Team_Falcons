import { fireEvent, render } from '@testing-library/react-native';

import i18n from '../ui/i18n';
import FavoritesScreen from '../favorites/FavoritesScreen';
import {
  isFavorite,
  removeFavoriteFromList,
  toggleFavoriteList,
} from '../favorites/storage';
import RecipeCard from '../ui/RecipeCard';

const sampleRecipe = {
  id: 1,
  name_en: 'Tomato and Egg Stir-Fry',
  name_zh: '西红柿炒鸡蛋',
  matched_count: 2,
  total_ingredients: 2,
  missing_count: 0,
  match_ratio: 1,
  is_full_match: true,
  matched_ingredient_details: [
    { id: 'tomato', name_en: 'Tomato', name_zh: '西红柿' },
    { id: 'egg', name_en: 'Egg', name_zh: '鸡蛋' },
  ],
  missing_ingredient_details: [],
};

describe('US6: Save recipes to favorites', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  test('toggles and removes recipes in favorites storage helpers', () => {
    const added = toggleFavoriteList([], sampleRecipe);
    expect(added).toHaveLength(1);
    expect(isFavorite(added, 1)).toBe(true);

    const toggledOff = toggleFavoriteList(added, sampleRecipe);
    expect(toggledOff).toHaveLength(0);
    expect(isFavorite(toggledOff, 1)).toBe(false);

    const removed = removeFavoriteFromList(added, 1);
    expect(removed).toHaveLength(0);
  });

  test('RecipeCard renders star button and reflects saved state', async () => {
    const onToggle = jest.fn();
    const view = await render(
      <RecipeCard recipe={sampleRecipe} isFavorite={false} onToggleFavorite={onToggle} />,
    );

    const starButton = view.getByTestId('favorite-toggle-1');
    expect(starButton.props.accessibilityState.selected).toBe(false);

    await fireEvent.press(starButton);
    expect(onToggle).toHaveBeenCalledWith(sampleRecipe);

    await view.rerender(
      <RecipeCard recipe={sampleRecipe} isFavorite={true} onToggleFavorite={onToggle} />,
    );
    expect(view.getByTestId('favorite-toggle-1').props.accessibilityState.selected).toBe(true);
  });

  test('FavoritesScreen displays saved dishes and removes a dish with one click', async () => {
    const onRemove = jest.fn();
    const view = await render(
      <FavoritesScreen favorites={[sampleRecipe]} onRemoveFavorite={onRemove} />,
    );

    expect(view.getByText('Tomato and Egg Stir-Fry')).toBeTruthy();
    await fireEvent.press(view.getByTestId('remove-favorite-1'));
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
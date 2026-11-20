import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { fetchIngredients, searchRecipes } from '../api/client';
import i18n from '../ui/i18n';
import SearchScreen from '../ui/SearchScreen';
import { INGREDIENTS, TOMATO_EGG_RESULTS, TOMATO_RESULTS } from './fixtures';

jest.mock('../api/client', () => {
  const actual = jest.requireActual('../api/client');
  return {
    ...actual,
    fetchIngredients: jest.fn(),
    searchRecipes: jest.fn(),
  };
});

beforeEach(async () => {
  await i18n.changeLanguage('en');
  fetchIngredients.mockResolvedValue(INGREDIENTS);
  searchRecipes.mockImplementation((ingredients) =>
    Promise.resolve(ingredients.length > 1 ? TOMATO_EGG_RESULTS : TOMATO_RESULTS),
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

async function renderLoaded() {
  await render(<SearchScreen />);
  await screen.findByTestId('common-tomato');
}

test('typing a Chinese alias adds an English tag and shows ranked results with missing items', async () => {
  await renderLoaded();

  await fireEvent.changeText(screen.getByTestId('ingredient-input'), '西红柿');
  await fireEvent(screen.getByTestId('ingredient-input'), 'submitEditing');

  expect(screen.getByTestId('tag-tomato')).toHaveTextContent(/Tomato/);
  await waitFor(() => expect(searchRecipes).toHaveBeenCalledWith(['tomato'], expect.anything()));

  expect(await screen.findByText('Tomato and Eggs')).toBeOnTheScreen();
  expect(screen.getByText('Partial matches')).toBeOnTheScreen();
  expect(screen.getByText('Missing (2)')).toBeOnTheScreen();
  expect(screen.getByTestId('missing-4-rice')).toHaveTextContent('Cooked rice');
});

test('full matches are grouped first and say all ingredients are ready', async () => {
  await renderLoaded();

  await fireEvent.press(screen.getByTestId('common-tomato'));
  await fireEvent.press(screen.getByTestId('common-egg'));

  expect(await screen.findByText('You can cook these now')).toBeOnTheScreen();
  expect(screen.getByText(/All ingredients ready/)).toBeOnTheScreen();
  expect(screen.getByText('Matched 2 of 2 ingredients')).toBeOnTheScreen();
  expect(searchRecipes).toHaveBeenLastCalledWith(['tomato', 'egg'], expect.anything());
});

test('tapping a tag removes it and clears the results', async () => {
  await renderLoaded();

  await fireEvent.press(screen.getByTestId('common-tomato'));
  await screen.findByText('Tomato and Eggs');

  await fireEvent.press(screen.getByTestId('tag-tomato'));

  expect(screen.queryByTestId('tag-tomato')).toBeNull();
  expect(screen.queryByText('Tomato and Eggs')).toBeNull();
  expect(screen.getByText('Add at least one ingredient to see matching recipes.')).toBeOnTheScreen();
});

test('the language toggle switches dish and ingredient names to Chinese', async () => {
  await renderLoaded();

  await fireEvent.press(screen.getByTestId('common-tomato'));
  await screen.findByText('Tomato and Eggs');

  await fireEvent.press(screen.getByTestId('language-toggle'));

  expect(screen.getByText('部分匹配')).toBeOnTheScreen();
  expect(screen.getByTestId('tag-tomato')).toHaveTextContent(/番茄/);
  expect(screen.getAllByText('番茄炒蛋').length).toBeGreaterThan(0);
});

test('shows a clear message when the backend cannot be reached', async () => {
  const { ApiError } = jest.requireActual('../api/client');
  searchRecipes.mockRejectedValue(new ApiError('network', 'down'));
  await renderLoaded();

  await fireEvent.press(screen.getByTestId('common-egg'));

  expect(await screen.findByTestId('search-error')).toHaveTextContent(/Cannot reach the server/);
});

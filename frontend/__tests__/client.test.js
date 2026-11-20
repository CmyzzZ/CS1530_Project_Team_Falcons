import { API_BASE_URL, ApiError, fetchIngredients, searchRecipes } from '../api/client';
import { INGREDIENTS, TOMATO_RESULTS } from './fixtures';

function jsonResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetchIngredients calls GET /ingredients', async () => {
  global.fetch = jest.fn(() => jsonResponse(200, { ingredients: INGREDIENTS }));

  await expect(fetchIngredients()).resolves.toEqual(INGREDIENTS);
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/ingredients`,
    expect.objectContaining({ method: 'GET' }),
  );
});

test('searchRecipes posts the ingredient list as JSON', async () => {
  global.fetch = jest.fn(() => jsonResponse(200, { results: TOMATO_RESULTS }));

  await expect(searchRecipes(['tomato', '鸡蛋'])).resolves.toEqual(TOMATO_RESULTS);

  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe(`${API_BASE_URL}/search`);
  expect(options.method).toBe('POST');
  expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(JSON.parse(options.body)).toEqual({ ingredients: ['tomato', '鸡蛋'] });
});

test('a 503 from the backend becomes an "unavailable" ApiError', async () => {
  global.fetch = jest.fn(() =>
    jsonResponse(503, { detail: 'Recipe database is unavailable. Please try again later.' }),
  );

  const error = await searchRecipes(['tomato']).catch((e) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect(error.kind).toBe('unavailable');
  expect(error.status).toBe(503);
});

test('a failed connection becomes a "network" ApiError', async () => {
  global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));

  const error = await fetchIngredients().catch((e) => e);
  expect(error).toBeInstanceOf(ApiError);
  expect(error.kind).toBe('network');
});

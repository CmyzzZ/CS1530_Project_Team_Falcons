// Same development data as backend/data_management/seed_data.py.
export const INGREDIENTS = [
  { id: 'cucumber', name_en: 'Cucumber', name_zh: '黄瓜', aliases: ['cucumbers'] },
  { id: 'egg', name_en: 'Egg', name_zh: '鸡蛋', aliases: ['eggs'] },
  { id: 'rice', name_en: 'Cooked rice', name_zh: '米饭', aliases: ['rice'] },
  { id: 'tomato', name_en: 'Tomato', name_zh: '番茄', aliases: ['tomatoes', '西红柿'] },
];

const detail = (id) => {
  const { name_en, name_zh } = INGREDIENTS.find((item) => item.id === id);
  return { id, name_en, name_zh };
};

// POST /search response for ["tomato"] (ids 1 and 4 contain tomato).
export const TOMATO_RESULTS = [
  {
    id: 1,
    name_en: 'Tomato and Eggs',
    name_zh: '番茄炒蛋',
    matched_ingredients: ['tomato'],
    missing_ingredients: ['egg'],
    matched_ingredient_details: [detail('tomato')],
    missing_ingredient_details: [detail('egg')],
    matched_count: 1,
    missing_count: 1,
    total_ingredients: 2,
    match_ratio: 0.5,
    is_full_match: false,
  },
  {
    id: 4,
    name_en: 'Tomato and Egg Rice',
    name_zh: '番茄鸡蛋饭',
    matched_ingredients: ['tomato'],
    missing_ingredients: ['egg', 'rice'],
    matched_ingredient_details: [detail('tomato')],
    missing_ingredient_details: [detail('egg'), detail('rice')],
    matched_count: 1,
    missing_count: 2,
    total_ingredients: 3,
    match_ratio: 1 / 3,
    is_full_match: false,
  },
];

// POST /search response for ["tomato", "egg"].
export const TOMATO_EGG_RESULTS = [
  {
    ...TOMATO_RESULTS[0],
    matched_ingredients: ['egg', 'tomato'],
    missing_ingredients: [],
    matched_ingredient_details: [detail('egg'), detail('tomato')],
    missing_ingredient_details: [],
    matched_count: 2,
    missing_count: 0,
    match_ratio: 1,
    is_full_match: true,
  },
  {
    ...TOMATO_RESULTS[1],
    matched_ingredients: ['egg', 'tomato'],
    missing_ingredients: ['rice'],
    matched_ingredient_details: [detail('egg'), detail('tomato')],
    missing_ingredient_details: [detail('rice')],
    matched_count: 2,
    missing_count: 1,
    match_ratio: 2 / 3,
  },
];

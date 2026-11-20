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
  tagLabel,
} from '../ui/ingredients';
import { INGREDIENTS } from './fixtures';

const index = buildAliasIndex(INGREDIENTS);

describe('cleanName (matches backend clean_name)', () => {
  test('folds case, full-width characters and whitespace', () => {
    expect(cleanName('  TOMATO ')).toBe('tomato');
    expect(cleanName('ＴＯＭＡＴＯ')).toBe('tomato');
    expect(cleanName('Cooked   rice')).toBe('cooked rice');
    expect(cleanName(' 鸡蛋 ')).toBe('鸡蛋');
  });
});

describe('makeTag', () => {
  test('resolves English, Chinese names and aliases to the same ingredient', () => {
    expect(makeTag('Tomato', index).key).toBe('tomato');
    expect(makeTag('番茄', index).key).toBe('tomato');
    expect(makeTag('西红柿', index).key).toBe('tomato');
    expect(makeTag('tomatoes', index).key).toBe('tomato');
    expect(makeTag('鸡蛋', index)).toMatchObject({ key: 'egg', value: 'egg', known: true });
  });

  test('keeps unknown text as an unrecognised tag', () => {
    expect(makeTag('Tofu', index)).toMatchObject({ key: 'raw:tofu', value: 'Tofu', known: false });
  });

  test('ignores blank input', () => {
    expect(makeTag('   ', index)).toBeNull();
  });
});

describe('addTags / removeTag', () => {
  test('does not add the same ingredient twice in different languages', () => {
    const first = addTags([], [makeTag('tomato', index)]);
    const second = addTags(first.tags, [makeTag('西红柿', index), makeTag('egg', index)]);

    expect(second.tags.map((tag) => tag.key)).toEqual(['tomato', 'egg']);
    expect(second.added).toBe(1);
    expect(second.duplicates).toBe(1);
  });

  test('removes a tag by key without touching the others', () => {
    const { tags } = addTags([], [makeTag('tomato', index), makeTag('egg', index)]);
    expect(removeTag(tags, 'tomato').map((tag) => tag.key)).toEqual(['egg']);
    expect(tags).toHaveLength(2);
  });

  test('respects the backend limit of 50 ingredients', () => {
    const many = Array.from({ length: MAX_INGREDIENTS + 3 }, (_, i) => makeTag(`item ${i}`, index));
    const outcome = addTags([], many);
    expect(outcome.tags).toHaveLength(MAX_INGREDIENTS);
    expect(outcome.overflow).toBe(3);
  });
});

test('splitInput accepts English and Chinese separators', () => {
  expect(splitInput('tomato, egg，米饭、黄瓜')).toEqual(['tomato', 'egg', '米饭', '黄瓜']);
  expect(splitInput(' , ')).toEqual([]);
});

test('suggestIngredients lists prefix matches first and skips selected ones', () => {
  expect(suggestIngredients('ri', INGREDIENTS).map((item) => item.id)).toEqual(['rice']);
  expect(suggestIngredients('番', INGREDIENTS).map((item) => item.id)).toEqual(['tomato']);
  expect(suggestIngredients('cu', INGREDIENTS, ['cucumber'])).toEqual([]);
  expect(suggestIngredients('', INGREDIENTS)).toEqual([]);
});

test('labels follow the chosen language and the payload uses ingredient ids', () => {
  const { tags } = addTags([], [makeTag('西红柿', index), makeTag('Tofu', index)]);
  expect(tags.map((tag) => tagLabel(tag, 'en'))).toEqual(['Tomato', 'Tofu']);
  expect(tags.map((tag) => tagLabel(tag, 'zh'))).toEqual(['番茄', 'Tofu']);
  expect(searchPayload(tags)).toEqual(['tomato', 'Tofu']);
});

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Interpolated numbers use `n` rather than `count` so i18next does not try
// plural resolution (not needed for these two languages).
const resources = {
  en: {
    translation: {
      appTitle: 'Chinese Cuisine Knowledge Base',
      appSubtitle: 'Tell us what is in your kitchen and we will find Chinese dishes you can cook.',
      languageToggle: '中文',
      languageToggleLabel: 'Switch to Chinese',
      inputLabel: 'Your ingredients',
      inputPlaceholder: 'Type an ingredient in English or Chinese, e.g. tomato or 鸡蛋',
      inputHint: 'Press Enter or Add. Separate several with commas.',
      add: 'Add',
      clearAll: 'Clear all',
      commonIngredients: 'Common ingredients',
      removeTagLabel: 'Remove {{name}}',
      tapToRemove: 'Tap a tag to remove it.',
      unknownIngredient: 'Not in our ingredient list yet, so it will not match any recipe.',
      duplicateIngredient: 'That ingredient is already in your list.',
      tooManyIngredients: 'You can add at most {{n}} ingredients.',
      catalogError: 'Could not load the ingredient list. You can still type ingredients.',
      retry: 'Retry',
      emptyPrompt: 'Add at least one ingredient to see matching recipes.',
      searching: 'Searching recipes…',
      resultsSummary: '{{n}} recipes found in {{ms}} ms',
      noResults: 'No recipes use these ingredients yet. Try adding another ingredient.',
      fullMatches: 'You can cook these now',
      partialMatches: 'Partial matches',
      fullMatchBadge: 'All ingredients ready',
      partialMatchBadge: 'Missing {{n}}',
      matchedCount: 'Matched {{matched}} of {{total}} ingredients',
      youHave: 'You have',
      missing: 'Missing ({{n}})',
      errorNetwork: 'Cannot reach the server at {{url}}. Is the backend running?',
      errorTimeout: 'The server took too long to answer. Please try again.',
      errorUnavailable: 'The recipe database is unavailable. Please try again later.',
      errorGeneric: 'Something went wrong while searching. Please try again.',
    },
  },
  zh: {
    translation: {
      appTitle: '中华美食知识库',
      appSubtitle: '告诉我们你厨房里有什么，我们帮你找能做的中国菜。',
      languageToggle: 'English',
      languageToggleLabel: '切换到英文',
      inputLabel: '你的食材',
      inputPlaceholder: '用中文或英文输入食材，例如 番茄 或 egg',
      inputHint: '按回车或点击“添加”。多个食材可用逗号分隔。',
      add: '添加',
      clearAll: '全部清除',
      commonIngredients: '常用食材',
      removeTagLabel: '移除 {{name}}',
      tapToRemove: '点击标签即可移除。',
      unknownIngredient: '食材库里还没有这个食材，因此不会匹配到菜谱。',
      duplicateIngredient: '这个食材已经在列表里了。',
      tooManyIngredients: '最多只能添加 {{n}} 种食材。',
      catalogError: '食材列表加载失败，你仍然可以手动输入食材。',
      retry: '重试',
      emptyPrompt: '至少添加一种食材即可查看匹配的菜谱。',
      searching: '正在搜索菜谱…',
      resultsSummary: '找到 {{n}} 道菜，用时 {{ms}} 毫秒',
      noResults: '暂时没有用到这些食材的菜谱，试试再加一种食材。',
      fullMatches: '现在就能做',
      partialMatches: '部分匹配',
      fullMatchBadge: '食材已备齐',
      partialMatchBadge: '缺 {{n}} 样',
      matchedCount: '已匹配 {{matched}} / {{total}} 种食材',
      youHave: '已有',
      missing: '缺少（{{n}}）',
      errorNetwork: '无法连接服务器 {{url}}，后端是否已启动？',
      errorTimeout: '服务器响应超时，请重试。',
      errorUnavailable: '菜谱数据库暂时不可用，请稍后再试。',
      errorGeneric: '搜索时出现问题，请重试。',
    },
  },
};

function initialLanguage() {
  const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : '';
  return typeof browserLanguage === 'string' && browserLanguage.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage(),
    fallbackLng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false },
  });
}

export default i18n;

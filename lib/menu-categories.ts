/**
 * Maps DB / smart-classifier category strings to UI buckets used in reception & filters.
 * Backend may emit: beverages, main_course, starters, fast_food, etc.
 */
export type MenuCategoryBucket =
  | 'appetizer'
  | 'main'
  | 'side'
  | 'dessert'
  | 'beverage'
  | 'other';

const RAW_TO_BUCKET: Record<string, MenuCategoryBucket> = {
  appetizer: 'appetizer',
  starters: 'appetizer',
  starter: 'appetizer',
  side: 'side',
  sides: 'side',
  salad: 'side',
  main: 'main',
  main_course: 'main',
  fast_food: 'main',
  seafood: 'main',
  grill_bbq: 'main',
  breakfast: 'main',
  dessert: 'dessert',
  desserts: 'dessert',
  beverage: 'beverage',
  beverages: 'beverage',
  other: 'other',
};

/** Portal filter pills use: main | appetizer | side | beverage | dessert | all */
export function portalFilterMatchesCategory(
  selected: string,
  rawCategory: string
): boolean {
  if (!selected || selected === 'all') return true;
  const bucket = normalizeMenuCategory(rawCategory);
  if (selected === 'main') return bucket === 'main';
  if (selected === 'appetizer') return bucket === 'appetizer';
  if (selected === 'side') return bucket === 'side';
  if (selected === 'beverage') return bucket === 'beverage';
  if (selected === 'dessert') return bucket === 'dessert';
  return false;
}

export function normalizeMenuCategory(raw: string | undefined | null): MenuCategoryBucket {
  if (!raw || typeof raw !== 'string') return 'other';
  const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
  return RAW_TO_BUCKET[key] ?? 'other';
}

export const BUCKET_ORDER: MenuCategoryBucket[] = [
  'appetizer',
  'main',
  'side',
  'dessert',
  'beverage',
  'other',
];

export const BUCKET_LABELS: Record<MenuCategoryBucket, string> = {
  appetizer: 'Appetizers',
  main: 'Main Courses',
  side: 'Sides',
  dessert: 'Desserts',
  beverage: 'Beverages',
  other: 'Other',
};

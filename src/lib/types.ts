import type { Lang } from "./i18n";

export type Difficulty = "easy" | "medium" | "hard";

export interface RecipeRequest {
  cuisine: string;
  language: Lang;
  ingredients: string[];
  timeMinutes: number;
  servings: number;
  dietary: string[];
  allowExtraIngredients: boolean;
  notes?: string;
}

export interface RecipeIngredient {
  item: string;
  quantity: string;
  haveIt: boolean;
}

export interface RecipeStep {
  instruction: string;
  minutes: number;
}

export interface DishPhoto {
  url: string;
  fullUrl: string;
  title: string;
  credit: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
  source: "Openverse" | "Wikimedia Commons";
}

export interface Recipe {
  title: string;
  photoQuery: string;
  cuisine: string;
  description: string;
  totalMinutes: number;
  activeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  ingredients: RecipeIngredient[];
  shoppingList: string[];
  steps: RecipeStep[];
  tips: string[];
  photos?: DishPhoto[];
}

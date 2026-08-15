export type Difficulty = "easy" | "medium" | "hard";

export interface RecipeRequest {
  cuisine: string;
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

export interface Recipe {
  title: string;
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
}

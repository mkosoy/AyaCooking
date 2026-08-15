export type Lang = "en" | "ru";

export const LANGS: Lang[] = ["en", "ru"];

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "ru";
}

const strings = {
  tagline: {
    en: "Name a cuisine, list what's in your kitchen, say how long you've got. One recipe that fits — no scrolling past someone's childhood story.",
    ru: "Назовите кухню, перечислите, что есть на кухне, и скажите, сколько у вас времени. Один подходящий рецепт — без чужих детских воспоминаний.",
  },
  cuisineLabel: { en: "1. What cuisine?", ru: "1. Какая кухня?" },
  cuisinePlaceholder: {
    en: "Georgian, Oaxacan, Sichuan…",
    ru: "Грузинская, оахакская, сычуаньская…",
  },
  addCuisine: { en: "Add", ru: "Добавить" },
  myCuisines: { en: "My cuisines", ru: "Мои кухни" },
  removeCuisine: { en: "Remove cuisine", ru: "Удалить кухню" },
  ingredientsLabel: {
    en: "2. What ingredients do you have?",
    ru: "2. Какие продукты у вас есть?",
  },
  ingredientsPlaceholder: {
    en: "walnuts, chicken thighs, coriander — press Enter after each",
    ru: "грецкие орехи, куриные бёдра, кориандр — Enter после каждого",
  },
  timeLabel: { en: "3. How much time do you have?", ru: "3. Сколько у вас времени?" },
  minutesShort: { en: "min", ru: "мин" },
  servings: { en: "Servings", ru: "Порции" },
  pantryRules: { en: "Pantry rules", ru: "Правила по продуктам" },
  allowExtra: {
    en: "Suggest a few extra ingredients worth buying",
    ru: "Предлагать несколько продуктов, которые стоит купить",
  },
  dietaryNeeds: { en: "Dietary needs", ru: "Ограничения в еде" },
  anythingElse: { en: "Anything else?", ru: "Что-нибудь ещё?" },
  notesPlaceholder: {
    en: "No oven, cooking for a kid, want it spicy…",
    ru: "Без духовки, готовлю для ребёнка, хочу поострее…",
  },
  submit: { en: "Give me a recipe", ru: "Дайте мне рецепт" },
  submitting: { en: "Writing your recipe…", ru: "Пишу ваш рецепт…" },
  genericError: { en: "Something went wrong", ru: "Что-то пошло не так" },
  total: { en: "Total", ru: "Всего" },
  handsOn: { en: "Hands-on", ru: "Активно" },
  serves: { en: "Serves", ru: "Порций" },
  difficulty: { en: "Difficulty", ru: "Сложность" },
  easy: { en: "easy", ru: "легко" },
  medium: { en: "medium", ru: "средне" },
  hard: { en: "hard", ru: "сложно" },
  ingredients: { en: "Ingredients", ru: "Ингредиенты" },
  toBuy: { en: "(to buy)", ru: "(купить)" },
  shoppingList: { en: "Shopping list", ru: "Список покупок" },
  method: { en: "Method", ru: "Приготовление" },
  cooksNotes: { en: "Cook's notes", ru: "Заметки повара" },
  photoCaption: { en: "Photo of a similar dish", ru: "Фото похожего блюда" },
  showPhoto: { en: "Show photo", ru: "Показать фото" },
  language: { en: "Language", ru: "Язык" },
} as const;

export type StringKey = keyof typeof strings;

export function t(lang: Lang, key: StringKey): string {
  return strings[key][lang];
}

/**
 * Built-in quick picks. The English name is what the model is asked for; the
 * label is only what the cook sees.
 */
export const CUISINES: { value: string; label: Record<Lang, string> }[] = [
  { value: "Georgian", label: { en: "Georgian", ru: "Грузинская" } },
  { value: "Russian", label: { en: "Russian", ru: "Русская" } },
  { value: "Japanese", label: { en: "Japanese", ru: "Японская" } },
  { value: "Thai", label: { en: "Thai", ru: "Тайская" } },
  { value: "Mexican", label: { en: "Mexican", ru: "Мексиканская" } },
  { value: "Sicilian", label: { en: "Sicilian", ru: "Сицилийская" } },
  { value: "Lebanese", label: { en: "Lebanese", ru: "Ливанская" } },
  { value: "Ethiopian", label: { en: "Ethiopian", ru: "Эфиопская" } },
  { value: "Vietnamese", label: { en: "Vietnamese", ru: "Вьетнамская" } },
  { value: "Uzbek", label: { en: "Uzbek", ru: "Узбекская" } },
  { value: "Korean", label: { en: "Korean", ru: "Корейская" } },
  { value: "Indian", label: { en: "Indian", ru: "Индийская" } },
  { value: "French", label: { en: "French", ru: "Французская" } },
];

export const DIETARY: { value: string; label: Record<Lang, string> }[] = [
  { value: "vegetarian", label: { en: "vegetarian", ru: "вегетарианское" } },
  { value: "vegan", label: { en: "vegan", ru: "веганское" } },
  { value: "gluten-free", label: { en: "gluten-free", ru: "без глютена" } },
  { value: "dairy-free", label: { en: "dairy-free", ru: "без молочного" } },
  { value: "nut-free", label: { en: "nut-free", ru: "без орехов" } },
  { value: "pescatarian", label: { en: "pescatarian", ru: "пескетарианское" } },
  { value: "halal", label: { en: "halal", ru: "халяль" } },
  { value: "low-carb", label: { en: "low-carb", ru: "мало углеводов" } },
];

export const API_ERRORS = {
  noCuisine: {
    en: "Tell me a cuisine first (e.g. Georgian, Thai, Sicilian).",
    ru: "Сначала назовите кухню (например, грузинская, тайская, сицилийская).",
  },
  badBody: { en: "Invalid request body", ru: "Некорректный запрос" },
  badJson: { en: "Invalid JSON body", ru: "Некорректный JSON" },
  badTime: {
    en: "How much time do you have? Pick between 5 and 600 minutes.",
    ru: "Сколько у вас времени? Выберите от 5 до 600 минут.",
  },
  missingKey: {
    en: "The server is missing GEMINI_API_KEY. Add it to .env.local and restart.",
    ru: "На сервере нет GEMINI_API_KEY. Добавьте ключ в .env.local и перезапустите.",
  },
  generationFailed: {
    en: "Could not write that recipe. Please try again.",
    ru: "Не удалось составить рецепт. Попробуйте ещё раз.",
  },
} as const satisfies Record<string, Record<Lang, string>>;

export function apiError(lang: Lang, key: keyof typeof API_ERRORS): string {
  return API_ERRORS[key][lang];
}

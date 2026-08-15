import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { Recipe, RecipeRequest } from "./types";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const recipeSchema: Schema = {
  type: Type.OBJECT,
  required: [
    "title",
    "cuisine",
    "description",
    "totalMinutes",
    "activeMinutes",
    "servings",
    "difficulty",
    "ingredients",
    "shoppingList",
    "steps",
    "tips",
  ],
  properties: {
    title: { type: Type.STRING },
    cuisine: { type: Type.STRING },
    description: { type: Type.STRING },
    totalMinutes: { type: Type.INTEGER },
    activeMinutes: { type: Type.INTEGER },
    servings: { type: Type.INTEGER },
    difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["item", "quantity", "haveIt"],
        properties: {
          item: { type: Type.STRING },
          quantity: { type: Type.STRING },
          haveIt: { type: Type.BOOLEAN },
        },
      },
    },
    shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["instruction", "minutes"],
        properties: {
          instruction: { type: Type.STRING },
          minutes: { type: Type.INTEGER },
        },
      },
    },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

function buildPrompt(req: RecipeRequest): string {
  const pantry = req.ingredients.length
    ? req.ingredients.join(", ")
    : "(the cook did not list anything specific)";

  const lines = [
    `You are an experienced ${req.cuisine} cook. Create one authentic ${req.cuisine} recipe.`,
    "",
    `Ingredients on hand: ${pantry}`,
    `Total time available: ${req.timeMinutes} minutes, start to plate.`,
    `Servings: ${req.servings}`,
  ];

  if (req.dietary.length) {
    lines.push(`Dietary requirements that must be respected: ${req.dietary.join(", ")}`);
  }
  if (req.notes?.trim()) {
    lines.push(`Extra notes from the cook: ${req.notes.trim()}`);
  }

  lines.push(
    "",
    "Rules:",
    `- totalMinutes must be <= ${req.timeMinutes}. If the classic version cannot fit, adapt it (quicker cut of meat, pressure cooker, smaller portions) and explain the shortcut in tips.`,
    "- Stay recognisably true to the cuisine: use its characteristic spices, techniques and names. Give the dish its native name plus an English gloss when useful.",
    "- Mark haveIt=true only for ingredients the cook listed (or obvious staples they listed). Everything else is haveIt=false and must also appear in shoppingList.",
    req.allowExtraIngredients
      ? "- You may add a small number of extra ingredients that are worth a trip to the shop; keep shoppingList short and cheap."
      : "- Use ONLY the listed ingredients plus water, salt, pepper, oil and common dry spices. shoppingList must be empty.",
    "- steps.minutes are per-step and should roughly sum to totalMinutes; activeMinutes excludes unattended time.",
    "- Instructions must be specific: temperatures, pan sizes, visual cues. No vague 'cook until done'.",
  );

  return lines.join("\n");
}

export async function generateRecipe(req: RecipeRequest): Promise<Recipe> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(req),
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
      temperature: 0.9,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("The model returned an empty response");
  }

  const recipe = JSON.parse(text) as Recipe;
  if (!recipe.title || !Array.isArray(recipe.steps)) {
    throw new Error("The model returned a malformed recipe");
  }
  return recipe;
}

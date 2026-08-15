import { generateRecipe } from "@/lib/gemini";
import { apiError, isLang, type Lang } from "@/lib/i18n";
import { findDishPhotos } from "@/lib/photos";
import type { RecipeRequest } from "@/lib/types";

const MAX_INGREDIENTS = 40;
const CYRILLIC = /[\u0400-\u04ff]/;

function parseBody(body: unknown): RecipeRequest | string {
  if (typeof body !== "object" || body === null) {
    return apiError("en", "badBody");
  }
  const raw = body as Record<string, unknown>;
  const language: Lang = isLang(raw.language) ? raw.language : "en";

  const cuisine = typeof raw.cuisine === "string" ? raw.cuisine.trim() : "";
  if (!cuisine) {
    return apiError(language, "noCuisine");
  }

  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients
        .filter((i): i is string => typeof i === "string")
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, MAX_INGREDIENTS)
    : [];

  const timeMinutes = Number(raw.timeMinutes);
  if (!Number.isFinite(timeMinutes) || timeMinutes < 5 || timeMinutes > 600) {
    return apiError(language, "badTime");
  }

  const servingsValue = Number(raw.servings);
  const servings =
    Number.isFinite(servingsValue) && servingsValue >= 1 && servingsValue <= 20
      ? Math.round(servingsValue)
      : 2;

  const dietary = Array.isArray(raw.dietary)
    ? raw.dietary.filter((d): d is string => typeof d === "string").slice(0, 10)
    : [];

  return {
    cuisine: cuisine.slice(0, 60),
    language,
    ingredients,
    timeMinutes: Math.round(timeMinutes),
    servings,
    dietary,
    allowExtraIngredients: raw.allowExtraIngredients !== false,
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 500) : undefined,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: apiError("en", "badJson") }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (typeof parsed === "string") {
    return Response.json({ error: parsed }, { status: 400 });
  }

  try {
    const recipe = await generateRecipe(parsed);
    // Photo archives are searched in Latin script, so Cyrillic recipe text is
    // useless as a fallback query.
    const photos = await findDishPhotos(
      [recipe.photoQuery, recipe.title, `${recipe.cuisine} food`].filter(
        (candidate) => !CYRILLIC.test(candidate),
      ),
    );
    return Response.json({ recipe: { ...recipe, photos } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const missingKey = message.includes("GEMINI_API_KEY");
    console.error("recipe generation failed:", message);
    return Response.json(
      {
        error: missingKey
          ? apiError(parsed.language, "missingKey")
          : apiError(parsed.language, "generationFailed"),
      },
      { status: missingKey ? 500 : 502 },
    );
  }
}

"use client";

import { useMemo, useState } from "react";
import { CUISINES, DIETARY, t, type Lang } from "@/lib/i18n";
import { useStoredString } from "@/lib/storage";
import type { Recipe } from "@/lib/types";

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];
const CUISINE_STORAGE_KEY = "sous.customCuisines";
const MAX_CUSTOM_CUISINES = 20;
const MAX_CUISINE_LENGTH = 60;

function parseIngredients(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export default function RecipeForm({
  lang,
  onRecipe,
}: {
  lang: Lang;
  onRecipe: (recipe: Recipe | null) => void;
}) {
  const [cuisine, setCuisine] = useState("Georgian");
  const [storedCuisines, storeCuisines] = useStoredString(CUISINE_STORAGE_KEY);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [timeMinutes, setTimeMinutes] = useState(45);
  const [servings, setServings] = useState(2);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allowExtraIngredients, setAllowExtraIngredients] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customCuisines = useMemo(() => {
    if (!storedCuisines) return [];
    try {
      const parsed: unknown = JSON.parse(storedCuisines);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((entry): entry is string => typeof entry === "string")
        .slice(0, MAX_CUSTOM_CUISINES);
    } catch {
      return [];
    }
  }, [storedCuisines]);

  function saveCustomCuisines(next: string[]) {
    storeCuisines(JSON.stringify(next));
  }

  function addCustomCuisine() {
    const value = cuisine.trim().slice(0, MAX_CUISINE_LENGTH);
    if (!value) return;
    const known = [...CUISINES.map((option) => option.value), ...customCuisines];
    if (known.some((entry) => entry.toLowerCase() === value.toLowerCase())) return;
    saveCustomCuisines([...customCuisines, value].slice(-MAX_CUSTOM_CUISINES));
  }

  function removeCustomCuisine(value: string) {
    saveCustomCuisines(customCuisines.filter((entry) => entry !== value));
  }

  function addIngredients(value: string) {
    const parts = parseIngredients(value);
    if (!parts.length) return;
    setIngredients((current) => [...new Set([...current, ...parts])]);
    setIngredientInput("");
  }

  function toggleDiet(diet: string) {
    setDietary((current) =>
      current.includes(diet) ? current.filter((d) => d !== diet) : [...current, diet],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const pending = parseIngredients(ingredientInput);
    const finalIngredients = pending.length
      ? [...new Set([...ingredients, ...pending])]
      : ingredients;
    setIngredients(finalIngredients);
    setIngredientInput("");
    setLoading(true);
    setError(null);
    onRecipe(null);

    try {
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuisine,
          language: lang,
          ingredients: finalIngredients,
          timeMinutes,
          servings,
          dietary,
          allowExtraIngredients,
          notes,
        }),
      });
      const data = (await response.json()) as { recipe?: Recipe; error?: string };
      if (!response.ok || !data.recipe) {
        throw new Error(data.error ?? t(lang, "genericError"));
      }
      onRecipe(data.recipe);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(lang, "genericError"));
    } finally {
      setLoading(false);
    }
  }

  const chipClass = (selected: boolean) =>
    selected
      ? "rounded-full bg-amber-900 px-3 py-1 text-sm text-amber-50"
      : "rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-200";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-sm sm:p-8"
    >
      <fieldset disabled={loading} className="space-y-7">
        <div>
          <label
            htmlFor="cuisine"
            className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
          >
            {t(lang, "cuisineLabel")}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="cuisine"
              value={cuisine}
              maxLength={MAX_CUISINE_LENGTH}
              onChange={(event) => setCuisine(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomCuisine();
                }
              }}
              placeholder={t(lang, "cuisinePlaceholder")}
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-amber-950 outline-none placeholder:text-amber-400 focus:border-amber-500"
            />
            <button
              type="button"
              onClick={addCustomCuisine}
              className="shrink-0 rounded-xl border border-amber-300 px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              + {t(lang, "addCuisine")}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CUISINES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCuisine(option.value)}
                className={chipClass(cuisine === option.value)}
              >
                {option.label[lang]}
              </button>
            ))}
          </div>

          {customCuisines.length > 0 && (
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-700/80">
                {t(lang, "myCuisines")}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {customCuisines.map((option) => (
                  <span key={option} className={`${chipClass(cuisine === option)} inline-flex`}>
                    <button type="button" onClick={() => setCuisine(option)}>
                      {option}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomCuisine(option)}
                      aria-label={`${t(lang, "removeCuisine")}: ${option}`}
                      className="ml-2 opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="ingredients"
            className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
          >
            {t(lang, "ingredientsLabel")}
          </label>
          <input
            id="ingredients"
            value={ingredientInput}
            onChange={(event) => setIngredientInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addIngredients(ingredientInput);
              }
            }}
            onBlur={() => addIngredients(ingredientInput)}
            placeholder={t(lang, "ingredientsPlaceholder")}
            className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-amber-950 outline-none placeholder:text-amber-400 focus:border-amber-500"
          />
          {ingredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ingredients.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIngredients((c) => c.filter((i) => i !== item))}
                  className="group rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-900 hover:bg-emerald-200"
                >
                  {item}
                  <span className="ml-2 text-emerald-700/60 group-hover:text-emerald-900">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
          >
            {t(lang, "timeLabel")}
          </label>
          <div className="mt-2 flex items-center gap-4">
            <input
              id="time"
              type="range"
              min={10}
              max={180}
              step={5}
              value={timeMinutes}
              onChange={(event) => setTimeMinutes(Number(event.target.value))}
              className="w-full accent-amber-800"
            />
            <span className="w-24 shrink-0 text-right text-lg font-semibold text-amber-950">
              {timeMinutes} {t(lang, "minutesShort")}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTimeMinutes(preset)}
                className={chipClass(timeMinutes === preset)}
              >
                {preset} {t(lang, "minutesShort")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="servings"
              className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
            >
              {t(lang, "servings")}
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              max={20}
              value={servings}
              onChange={(event) => setServings(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-amber-950 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <span className="block text-sm font-semibold uppercase tracking-wide text-amber-800">
              {t(lang, "pantryRules")}
            </span>
            <label className="mt-3 flex items-start gap-3 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={allowExtraIngredients}
                onChange={(event) => setAllowExtraIngredients(event.target.checked)}
                className="mt-0.5 size-4 accent-amber-800"
              />
              {t(lang, "allowExtra")}
            </label>
          </div>
        </div>

        <div>
          <span className="block text-sm font-semibold uppercase tracking-wide text-amber-800">
            {t(lang, "dietaryNeeds")}
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIETARY.map((diet) => (
              <button
                key={diet.value}
                type="button"
                onClick={() => toggleDiet(diet.value)}
                className={chipClass(dietary.includes(diet.value))}
              >
                {diet.label[lang]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
          >
            {t(lang, "anythingElse")}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder={t(lang, "notesPlaceholder")}
            className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-amber-950 outline-none placeholder:text-amber-400 focus:border-amber-500"
          />
        </div>
      </fieldset>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-amber-900 px-6 py-4 text-lg font-semibold text-amber-50 transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-amber-900/50"
      >
        {loading ? t(lang, "submitting") : t(lang, "submit")}
      </button>
    </form>
  );
}

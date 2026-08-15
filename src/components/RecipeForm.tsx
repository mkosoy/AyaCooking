"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/types";

const CUISINES = [
  "Georgian",
  "Japanese",
  "Thai",
  "Mexican",
  "Sicilian",
  "Lebanese",
  "Ethiopian",
  "Vietnamese",
  "Peruvian",
  "Korean",
  "Indian",
  "French",
];

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];

const DIETARY = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
  "halal",
  "low-carb",
];

export default function RecipeForm({
  onRecipe,
}: {
  onRecipe: (recipe: Recipe | null) => void;
}) {
  const [cuisine, setCuisine] = useState("Georgian");
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [timeMinutes, setTimeMinutes] = useState(45);
  const [servings, setServings] = useState(2);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allowExtraIngredients, setAllowExtraIngredients] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addIngredients(value: string) {
    const parts = value
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
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
    const pending = ingredientInput.trim();
    const finalIngredients = pending
      ? [...new Set([...ingredients, ...pending.split(",").map((p) => p.trim().toLowerCase())])]
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
        throw new Error(data.error ?? "Something went wrong");
      }
      onRecipe(data.recipe);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
            1. What cuisine?
          </label>
          <input
            id="cuisine"
            value={cuisine}
            onChange={(event) => setCuisine(event.target.value)}
            placeholder="Georgian, Oaxacan, Sichuan…"
            className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-amber-950 outline-none placeholder:text-amber-400 focus:border-amber-500"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {CUISINES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCuisine(option)}
                className={
                  cuisine === option
                    ? "rounded-full bg-amber-900 px-3 py-1 text-sm text-amber-50"
                    : "rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-200"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="ingredients"
            className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
          >
            2. What ingredients do you have?
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
            placeholder="walnuts, chicken thighs, coriander — press Enter after each"
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
            3. How much time do you have?
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
              {timeMinutes} min
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTimeMinutes(preset)}
                className={
                  timeMinutes === preset
                    ? "rounded-full bg-amber-900 px-3 py-1 text-sm text-amber-50"
                    : "rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-200"
                }
              >
                {preset} min
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
              Servings
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
              Pantry rules
            </span>
            <label className="mt-3 flex items-start gap-3 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={allowExtraIngredients}
                onChange={(event) => setAllowExtraIngredients(event.target.checked)}
                className="mt-0.5 size-4 accent-amber-800"
              />
              Suggest a few extra ingredients worth buying
            </label>
          </div>
        </div>

        <div>
          <span className="block text-sm font-semibold uppercase tracking-wide text-amber-800">
            Dietary needs
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIETARY.map((diet) => (
              <button
                key={diet}
                type="button"
                onClick={() => toggleDiet(diet)}
                className={
                  dietary.includes(diet)
                    ? "rounded-full bg-amber-900 px-3 py-1 text-sm text-amber-50"
                    : "rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-200"
                }
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold uppercase tracking-wide text-amber-800"
          >
            Anything else?
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="No oven, cooking for a kid, want it spicy…"
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
        {loading ? "Writing your recipe…" : "Give me a recipe"}
      </button>
    </form>
  );
}

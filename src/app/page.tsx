"use client";

import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import RecipeForm from "@/components/RecipeForm";
import type { Recipe } from "@/lib/types";

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-amber-950 sm:text-5xl">Sous</h1>
        <p className="mt-3 text-lg text-amber-900/80">
          Name a cuisine, list what&apos;s in your kitchen, say how long you&apos;ve got. One
          recipe that fits — no scrolling past someone&apos;s childhood story.
        </p>
      </header>

      <RecipeForm onRecipe={setRecipe} />

      {recipe && (
        <div className="mt-10">
          <RecipeCard recipe={recipe} />
        </div>
      )}
    </main>
  );
}

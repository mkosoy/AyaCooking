"use client";

import { useEffect, useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import RecipeForm from "@/components/RecipeForm";
import { isLang, LANGS, t, type Lang } from "@/lib/i18n";
import { useStoredString } from "@/lib/storage";
import type { Recipe } from "@/lib/types";

const LANG_STORAGE_KEY = "sous.lang";

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [storedLang, storeLang] = useStoredString(LANG_STORAGE_KEY);
  const lang: Lang = isLang(storedLang) ? storedLang : "en";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <div
          role="group"
          aria-label={t(lang, "language")}
          className="mb-6 flex justify-center gap-1"
        >
          {LANGS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => storeLang(option)}
              aria-pressed={lang === option}
              className={
                lang === option
                  ? "rounded-full bg-amber-900 px-3 py-1 text-sm font-semibold text-amber-50"
                  : "rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-200"
              }
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-amber-950 sm:text-5xl">Sous</h1>
        <p className="mt-3 text-lg text-amber-900/80">{t(lang, "tagline")}</p>
      </header>

      <RecipeForm lang={lang} onRecipe={setRecipe} />

      {recipe && (
        <div className="mt-10">
          <RecipeCard lang={lang} recipe={recipe} />
        </div>
      )}
    </main>
  );
}

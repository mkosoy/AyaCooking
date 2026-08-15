import DishPhotos from "./DishPhotos";
import type { Recipe } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-amber-100/70 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-amber-800/70">{label}</div>
      <div className="text-lg font-semibold text-amber-950">{value}</div>
    </div>
  );
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="rounded-3xl border border-amber-200 bg-white/80 p-6 shadow-sm sm:p-8">
      {recipe.photos && recipe.photos.length > 0 && (
        <DishPhotos key={recipe.photos[0].url} photos={recipe.photos} />
      )}

      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-amber-700">
          {recipe.cuisine}
        </p>
        <h2 className="mt-1 text-3xl font-bold text-amber-950">{recipe.title}</h2>
        <p className="mt-3 text-amber-900/80">{recipe.description}</p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={`${recipe.totalMinutes} min`} />
        <Stat label="Hands-on" value={`${recipe.activeMinutes} min`} />
        <Stat label="Serves" value={String(recipe.servings)} />
        <Stat label="Difficulty" value={recipe.difficulty} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
        <section>
          <h3 className="text-lg font-semibold text-amber-950">Ingredients</h3>
          <ul className="mt-3 space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={`${ingredient.item}-${ingredient.quantity}`}
                className="flex items-baseline gap-2 text-amber-900"
              >
                <span
                  aria-hidden
                  className={
                    ingredient.haveIt
                      ? "mt-1 size-2 shrink-0 rounded-full bg-emerald-500"
                      : "mt-1 size-2 shrink-0 rounded-full bg-amber-400"
                  }
                />
                <span>
                  <span className="font-medium">{ingredient.quantity}</span> {ingredient.item}
                  {!ingredient.haveIt && (
                    <span className="ml-1 text-xs text-amber-700/80">(to buy)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {recipe.shoppingList.length > 0 && (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                Shopping list
              </h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">
                {recipe.shoppingList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold text-amber-950">Method</h3>
          <ol className="mt-3 space-y-4">
            {recipe.steps.map((step, index) => (
              <li key={step.instruction} className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-900 text-sm font-semibold text-amber-50">
                  {index + 1}
                </span>
                <div>
                  <p className="text-amber-900">{step.instruction}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-amber-700/70">
                    ~{step.minutes} min
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {recipe.tips.length > 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-amber-300 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
                Cook&apos;s notes
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                {recipe.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

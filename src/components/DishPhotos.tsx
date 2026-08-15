"use client";

import { useEffect, useState } from "react";
import type { DishPhoto } from "@/lib/types";

export default function DishPhotos({ photos }: { photos: DishPhoto[] }) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<string[]>([]);

  useEffect(() => {
    setActive(0);
    setBroken([]);
  }, [photos]);

  const usable = photos.filter((photo) => !broken.includes(photo.url));
  if (!usable.length) return null;

  const hero = usable[Math.min(active, usable.length - 1)];

  return (
    <figure className="mb-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- photo hosts vary per search result */}
      <img
        src={hero.url}
        alt={hero.title}
        className="aspect-[16/9] w-full rounded-2xl bg-amber-100 object-cover"
        onError={() => setBroken((current) => [...current, hero.url])}
      />

      {usable.length > 1 && (
        <div className="mt-3 flex gap-2">
          {usable.map((photo, index) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={photo.url === hero.url}
              className={
                photo.url === hero.url
                  ? "overflow-hidden rounded-lg ring-2 ring-amber-900"
                  : "overflow-hidden rounded-lg opacity-70 hover:opacity-100"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- photo hosts vary per search result */}
              <img
                src={photo.url}
                alt={photo.title}
                className="size-16 object-cover"
                onError={() => setBroken((current) => [...current, photo.url])}
              />
            </button>
          ))}
        </div>
      )}

      <figcaption className="mt-2 text-xs text-amber-700/80">
        Photo of a similar dish ·{" "}
        <a href={hero.sourceUrl} target="_blank" rel="noreferrer" className="underline">
          {hero.source}
        </a>{" "}
        · {hero.credit}
        {hero.license && (
          <>
            {" · "}
            {hero.licenseUrl ? (
              <a href={hero.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                {hero.license}
              </a>
            ) : (
              hero.license
            )}
          </>
        )}
      </figcaption>
    </figure>
  );
}

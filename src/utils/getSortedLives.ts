import type { CollectionEntry } from "astro:content";
import lifeFilter from "./lifeFilter";

const getSortedLives = (lives: CollectionEntry<"essay">[]) => {
  return lives
    .filter(lifeFilter)
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
};

export default getSortedLives;

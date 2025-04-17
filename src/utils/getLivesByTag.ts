import type { CollectionEntry } from "astro:content";
import getSortedLives from "./getSortedLives";
import { slugifyAll } from "./slugify";

const getLivesByTag = (lives: CollectionEntry<"essay">[], tag: string) =>
  getSortedLives(
    lives.filter((life) => slugifyAll(life.data.tags).includes(tag))
  );

export default getLivesByTag;

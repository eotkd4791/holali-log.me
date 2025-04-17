import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@utils/generateOgImages";
import { slugifyStr } from "@utils/slugify";

export async function getStaticPaths() {
  const lives = await getCollection("essay").then((p) =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return lives.map((life) => ({
    params: { slug: slugifyStr(life.data.title) },
    props: life,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(
    await generateOgImageForPost(props as CollectionEntry<"essay">),
    {
      headers: { "Content-Type": "image/png" },
    }
  );

// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "홀랄리 디스크";
export const SITE_DESCRIPTION = "blog for review";
export const TWITTER_HANDLE = "@devstef_";
export const MY_NAME = "stefan you";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;

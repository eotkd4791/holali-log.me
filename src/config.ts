// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "stefan you";
export const SITE_DESCRIPTION =
  "I am a web developer, and also lo-fi jazz creator :)";
export const TWITTER_HANDLE = "@devstef_";
export const MY_NAME = "stefan you";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;

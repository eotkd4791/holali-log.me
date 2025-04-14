import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://holali-log.me", // replace this with your deployed domain
  author: "유대상",
  desc: "유대상의 블로그",
  title: "개발F념",
  ogImage: "og-image.png",
  lightAndDarkMode: true,
  postPerPage: 20,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "ko", // html lang code. Set this empty and default will be "en"
  langTag: ["ko-KR"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: false,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/eotkd4791",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:eotkd4791@kakao.com",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
];

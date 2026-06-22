export type ThemeFamily = "steam" | "original";
export type ThemeMode = "dark" | "light";

export interface HeaderLink {
  label: string;
  href: string;
  icon: "github" | "gitlab" | "cv" | "mail" | "external";
}

export interface SiteConfig {
  name: string; // "Valentyn Matvieienko"
  role: string; // "Unity / C# & .NET developer"
  links: HeaderLink[]; // header buttons (GitHub, GitLab, CV…)
  themeFamily: ThemeFamily; // owner picks the palette family
  defaultMode: ThemeMode; // initial mode before visitor preference/localStorage
  categories: string[]; // filter tab order, e.g. ['Game dev','Backend','Tooling']
  // 'All' is implicit and always first.
  metaTitle: string;
  metaDescription: string;
}

export const site: SiteConfig = {
  name: "Valentyn Matvieienko",
  role: "Unity / C# & .NET developer",
  links: [
    { label: "GitHub", href: "https://github.com/vailshnast", icon: "github" },
    { label: "GitLab", href: "https://gitlab.com/", icon: "gitlab" },
    { label: "CV", href: "/cv.pdf", icon: "cv" },
  ],
  themeFamily: "steam",
  defaultMode: "dark",
  categories: ["Game dev", "Backend", "Tooling"],
  metaTitle: "Valentyn Matvieienko — Portfolio",
  metaDescription: "Selected Unity/C# and .NET projects.",
};

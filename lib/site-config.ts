export type HeroImageConfig = {
  url: string;
  alt: string;
  sizes: string;
  priority: boolean;
  objectPosition?: string;
};

export const siteConfig = {
  heroImages: {
    home: {
      url:
        "https://images.unsplash.com/photo-1560448075-bb4caa6c0f11?auto=format&fit=crop&w=1920&q=80",
      alt: "Sleek modern interior with natural daylight",
      sizes: "100vw",
      priority: true,
      objectPosition: "center",
    } as HeroImageConfig,
    auth: {
      url:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1920&q=80",
      alt: "Calm contemporary neighborhood at golden hour",
      sizes: "(min-width: 1024px) 50vw, 100vw",
      priority: true,
      objectPosition: "center",
    } as HeroImageConfig,
  },
} as const;

export type SiteConfig = typeof siteConfig;

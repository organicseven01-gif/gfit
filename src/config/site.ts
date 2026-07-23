export const site = {
  nome: "G FIT TIME",
  descricao:
    "Sistema de timers para academias — CrossFit, Hyrox e treino funcional.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Selo da marca em /public. */
  logo: "/marca/gfit-time.svg",
} as const;

export const ease = {
  softSettle: [0.22, 1, 0.36, 1] as const,
  cinematic: [0.16, 1, 0.3, 1] as const,
  snappy: [0.4, 0, 0.2, 1] as const,
  exit: [0.7, 0, 0.84, 0] as const,
} as const;

export const dur = {
  micro: 0.16,
  hover: 0.28,
  reveal: 0.6,
  section: 1.2,
  mode: 0.52,
  preloader: 0.65,
} as const;

export const stagger = {
  fast: 0.04,
  normal: 0.07,
  slow: 0.1,
} as const;

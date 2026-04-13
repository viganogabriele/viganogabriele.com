import { type ClassValue, clsx } from "clsx";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  Award,
  ChevronDown,
  Code2,
  Cpu,
  GitMerge,
  Globe,
  HardDrive,
  Layers,
  Menu,
  Mic2,
  Network,
  Palette,
  Server,
  Terminal,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { twMerge } from "tailwind-merge";
import logo from "./assets/logo-dark.png";
import portrait from "./assets/photo-gabriele.webp";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LenisModule = typeof import("lenis");
type LenisInstance = InstanceType<LenisModule["default"]>;

const SITE_URL = "https://viganogabriele.com";

const PageMeta = ({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (
      selector: string,
      content: string,
      attribute: "name" | "property",
      attributeValue: string,
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMeta('meta[name="description"]', description, "name", "description");
    setMeta('meta[property="og:title"]', title, "property", "og:title");
    setMeta(
      'meta[property="og:description"]',
      description,
      "property",
      "og:description",
    );

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE_URL}${path}`);
  }, [description, path, title]);

  return null;
};

const JsonLd = ({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}) => {
  useEffect(() => {
    let script = document.head.querySelector<HTMLScriptElement>(
      `script[data-jsonld="${id}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-jsonld", id);
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);

    return () => {
      script?.remove();
    };
  }, [data, id]);

  return null;
};

// ─── Touch detection ──────────────────────────────────────────────────────────
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const hasNoHoverPointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const isTelegramBrowser = () =>
  typeof navigator !== "undefined" && /Telegram/i.test(navigator.userAgent);

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4" />
  </svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const FigmaIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
  </svg>
);

// ─── Custom Cursor (desktop only) ────────────────────────────────────────────
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const [hoverLevel, setHoverLevel] = useState<"none" | "link" | "bubble">(
    "none",
  );
  const [isTouch] = useState(() => isTouchDevice());

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Velocity-based scaling
  const lastTime = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useMotionValue(0);
  const smoothVelocity = useSpring(velocity, { stiffness: 45, damping: 24 });

  const ringX = useSpring(mouseX, { stiffness: 75, damping: 20, mass: 1.2 });
  const ringY = useSpring(mouseY, { stiffness: 75, damping: 20, mass: 1.2 });

  const baseSize =
    hoverLevel === "bubble" ? 36 : hoverLevel === "link" ? 28 : 18;
  const ringSize = useTransform(
    smoothVelocity,
    [0, 1500],
    [baseSize, baseSize + 64],
  );
  const ringOp =
    hoverLevel === "bubble" ? 0.74 : hoverLevel === "link" ? 0.6 : 0.38;
  const internalBlur = useTransform(
    smoothVelocity,
    [0, 1500],
    ["blur(3px)", "blur(18px)"],
  );

  useEffect(() => {
    if (isTouch) return;
    lastTime.current = performance.now();

    const move = (e: MouseEvent) => {
      const now = performance.now();
      const dt = now - lastTime.current;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const v = (Math.sqrt(dx * dx + dy * dy) / (dt || 1)) * 100;

      velocity.set(Math.min(v, 2000));

      lastTime.current = now;
      lastPos.current = { x: e.clientX, y: e.clientY };

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", move);

    const enter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.dataset.cursorBubble !== undefined) setHoverLevel("bubble");
      else setHoverLevel("link");
    };
    const leave = () => {
      setHoverLevel("none");
    };

    const bind = () => {
      document
        .querySelectorAll<HTMLElement>("[data-cursor-bubble]")
        .forEach((el) => {
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
        });
      document
        .querySelectorAll<HTMLElement>('a, button, [data-cursor="hover"]')
        .forEach((el) => {
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
        });
    };
    bind();
    const obs = new MutationObserver(bind);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("mousemove", move);
      obs.disconnect();
    };
  }, [isTouch, mouseX, mouseY, velocity]);

  if (isTouch) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <motion.div
        className="cursor-ring"
        style={{
          left: ringX,
          top: ringY,
          width: ringSize,
          height: ringSize,
          backdropFilter: internalBlur,
          WebkitBackdropFilter: internalBlur,
        }}
        animate={{
          opacity: ringOp,
          borderColor:
            hoverLevel === "none"
              ? "rgba(255,255,255,0.24)"
              : "rgba(255,255,255,0.66)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  );
};

// ─── Glassmorphism Navbar ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "What I Do", href: "#expertise" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
];

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
const ScrollBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 26 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #67e8f9, #a78bfa)",
      }}
    />
  );
};

const Navbar = ({ onNavigate }: { onNavigate: (target: string) => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#about");
  const [isTouch] = useState(() => isTouchDevice());
  const [isTelegramWebView] = useState(() => isTelegramBrowser());
  const disableBackdrop = isTouch || isTelegramWebView;
  const navLockRef = useRef<{ target: string | null }>({ target: null });
  const navLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // IntersectionObserver — keeps activeSection in sync while scrolling
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.querySelector<HTMLElement>(link.href),
    ).filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry?.target.id) return;

        const nextSection = `#${visibleEntry.target.id}`;
        const lockTarget = navLockRef.current.target;
        if (lockTarget && nextSection !== lockTarget) {
          return;
        }

        if (lockTarget && nextSection === lockTarget) {
          navLockRef.current = { target: null };
          if (navLockTimeoutRef.current) {
            clearTimeout(navLockTimeoutRef.current);
            navLockTimeoutRef.current = null;
          }
        }

        setActiveSection(nextSection);
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0.1, 0.3, 0.6] },
    );

    sections.forEach((s) => {
      observer.observe(s);
    });
    return () => observer.disconnect();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    return () => {
      if (navLockTimeoutRef.current) clearTimeout(navLockTimeoutRef.current);
    };
  }, []);

  // NOTE: no body scroll lock — it breaks IntersectionObserver tracking

  const handleScrollTo = (e: React.MouseEvent<HTMLElement>, target: string) => {
    e.preventDefault();
    setMobileOpen(false);
    // Optimistic active update so indicator moves immediately on tap
    const match = NAV_LINKS.find((l) => l.href === target);
    if (match) {
      setActiveSection(match.href);
      navLockRef.current = { target: match.href };
      if (navLockTimeoutRef.current) clearTimeout(navLockTimeoutRef.current);
      navLockTimeoutRef.current = setTimeout(() => {
        navLockRef.current = { target: null };
        navLockTimeoutRef.current = null;
      }, 3200);
    }
    setTimeout(() => onNavigate(target), 60);
  };

  return (
    <>
      {/* Top edge gradient fade — blends page top into navbar */}
      <div
        className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-[47] gpu-promote"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,8,8,0.52) 0%, rgba(8,8,8,0.14) 52%, transparent 100%)",
        }}
      />

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[48] bg-black/50 backdrop-blur-[2px] lg:hidden gpu-promote"
            style={{
              backdropFilter: disableBackdrop ? "none" : undefined,
              WebkitBackdropFilter: disableBackdrop ? "none" : undefined,
            }}
          />
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[49] w-[92%] max-w-4xl"
      >
        {/* Subtle glow behind pill */}
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-[60%] h-8 bg-gradient-to-r from-transparent via-white/8 to-transparent blur-2xl" />

        {/* ── Pill ── */}
        <div
          className={cn(
            "px-4 sm:px-5 py-3 rounded-full border transition-all duration-500",
            scrolled
              ? "border-white/[0.10] shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
              : "border-white/[0.09] shadow-[0_3px_12px_rgba(0,0,0,0.12)]",
          )}
          style={{
            background: disableBackdrop
              ? scrolled
                ? "rgba(10, 8, 18, 0.92)"
                : "rgba(8, 6, 14, 0.90)"
              : scrolled
                ? "rgba(10, 8, 18, 0.36)"
                : "rgba(8, 6, 14, 0.22)",
            backdropFilter: disableBackdrop
              ? "none"
              : "blur(36px) saturate(190%)",
            WebkitBackdropFilter: disableBackdrop
              ? "none"
              : "blur(36px) saturate(190%)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              type="button"
              onClick={(e) => handleScrollTo(e, "body")}
              data-cursor="hover"
              className="flex items-center gap-3 group"
              aria-label="Scroll to top"
            >
              <img
                src={logo}
                alt="Gabriele Viganò"
                className="h-5 w-auto opacity-80 group-hover:opacity-100 transition-opacity filter invert"
              />
            </button>

            {/* Desktop links — animated sliding indicator via layoutId */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleScrollTo(e, link.href)}
                    data-cursor="hover"
                    className={cn(
                      "tap-highlight-none relative px-4 py-2 rounded-full text-[13px] font-medium transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-white/[0.09] pointer-events-none"
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <a
                href="mailto:info@viganogabriele.com"
                data-cursor="hover"
                className="hidden sm:inline-flex px-5 py-2 rounded-full text-[13px] font-bold text-black bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.35)]"
              >
                Let's talk
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen((p) => !p)}
                className={cn(
                  "tap-highlight-none lg:hidden w-9 h-9 rounded-full border transition-all duration-200 flex items-center justify-center",
                  mobileOpen
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10",
                )}
                aria-label="Toggle navigation menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex"
                    >
                      <X className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex"
                    >
                      <Menu className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile dropdown — separate transparent card below the pill ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden mt-2 p-2 rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{
                background: disableBackdrop
                  ? "rgba(10, 8, 18, 0.94)"
                  : "rgba(10, 8, 18, 0.32)",
                backdropFilter: disableBackdrop
                  ? "none"
                  : "blur(34px) saturate(185%)",
                WebkitBackdropFilter: disableBackdrop
                  ? "none"
                  : "blur(34px) saturate(185%)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.26)",
              }}
            >
              {/* Nav links — same layoutId-based sliding pill as desktop */}
              <nav className="flex flex-col gap-0.5">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeSection === link.href;
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleScrollTo(e, link.href)}
                      data-cursor="hover"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.04,
                        duration: 0.2,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn(
                        "tap-highlight-none relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors duration-150 active:scale-[0.98] select-none overflow-hidden",
                        isActive
                          ? "text-white"
                          : "text-zinc-400 hover:text-white",
                      )}
                    >
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-xl bg-white/[0.08] pointer-events-none"
                        initial={false}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{
                          duration: 0.18,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                      {/* Accent dot */}
                      <span
                        className={cn(
                          "relative z-10 w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300",
                          isActive ? "bg-white opacity-60" : "bg-white/20",
                        )}
                      />
                      <span className="relative z-10">{link.label}</span>
                    </motion.a>
                  );
                })}
              </nav>
              {/* Divider + Let's talk */}
              <div className="mt-1.5 pt-1.5 border-t border-white/[0.07] px-1">
                <motion.a
                  href="mailto:info@viganogabriele.com"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: NAV_LINKS.length * 0.04 + 0.04,
                    duration: 0.2,
                  }}
                  className="tap-highlight-none w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-[14px] font-semibold text-black bg-white hover:bg-zinc-100 transition-colors active:scale-[0.97]"
                >
                  Let's talk
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

// ─── Magnetic Wrapper ─────────────────────────────────────────────────────────
const Magnetic = ({
  children,
  strength = 0.4,
}: {
  children: React.ReactElement;
  strength?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

// ─── Floating Portrait ────────────────────────────────────────────────────────
const FloatingPortrait = () => {
  const [eggVisible, setEggVisible] = useState(false);
  const eggTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (eggTimerRef.current) clearTimeout(eggTimerRef.current);
    };
  }, []);

  const handlePortraitClick = () => {
    setEggVisible(true);
    if (eggTimerRef.current) clearTimeout(eggTimerRef.current);
    eggTimerRef.current = setTimeout(() => setEggVisible(false), 2200);
  };

  return (
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      className="relative z-10 w-60 md:w-80 flex justify-center cursor-pointer group"
      onClick={handlePortraitClick}
      whileTap={{ scale: 0.985 }}
    >
      {/* Soft dynamic glow behind silhouette */}
      <div className="absolute inset-x-0 top-[20%] bottom-0 bg-violet-600/20 blur-[80px] rounded-full scale-90 group-hover:bg-violet-500/30 transition-colors duration-700" />

      <AnimatePresence>
        {eggVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: -16, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="relative overflow-hidden whitespace-nowrap rounded-2xl border border-white/15 bg-black/45 px-4 py-2 backdrop-blur-xl shadow-[0_10px_28px_rgba(0,0,0,0.32)]">
              <motion.div
                aria-hidden
                className="absolute inset-0 opacity-65"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundImage:
                    "linear-gradient(100deg, rgba(34,211,238,0.16), rgba(167,139,250,0.16), rgba(244,114,182,0.14), rgba(34,211,238,0.16))",
                  backgroundSize: "220% 220%",
                }}
              />
              <span className="relative block text-[10px] tracking-[0.16em] uppercase text-zinc-100">
                <span className="bg-gradient-to-r from-cyan-100 via-violet-200 to-pink-200 bg-clip-text text-transparent font-semibold">
                  Built in Italy - 21 y/o
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-[340px] md:h-[470px] flex items-end justify-center">
        <div
          className="relative w-full h-full rounded-[44%_44%_16%_16%/34%_34%_18%_18%] overflow-hidden border border-white/10 bg-white/[0.02]"
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
            filter: "drop-shadow(0 24px 34px rgba(0,0,0,0.55))",
          }}
        >
          <img
            src={portrait}
            alt="Gabriele Viganò"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover object-[50%_18%] z-10 transition-transform duration-700 group-hover:scale-104"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/25 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Kinetic Tag ──────────────────────────────────────────────────────────────
const KineticTag = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
    >
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-zinc-300 text-xs font-semibold tracking-wide uppercase">
        Computer Engineering Student
      </span>
    </motion.div>
  );
};

// ─── Gradient Scramble Text ────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

const TextScramble = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [hasNoHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileFxRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gradientControls = useAnimationControls();
  const isInView = useInView(titleRef, {
    margin: "-20% 0px -20% 0px",
    once: false,
  });

  const scramble = useCallback((target: string) => {
    const frames = 18;
    let i = 0;
    const tick = () => {
      i++;
      const p = i / frames;
      setDisplay(
        target
          .split("")
          .map((c, idx) => {
            if (c === " ") return " ";
            if (idx / target.length < p) return c;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      if (i < frames) {
        timerRef.current = setTimeout(tick, 35);
      } else {
        setDisplay(target);
      }
    };
    if (timerRef.current) clearTimeout(timerRef.current);
    tick();
  }, []);

  useEffect(() => {
    scramble(text);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (mobileFxRef.current) clearTimeout(mobileFxRef.current);
    };
  }, [scramble, text]);

  useEffect(() => {
    if (!hasNoHover || !isInView) {
      return;
    }

    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      scramble(text);
      mobileFxRef.current = setTimeout(runCycle, 3600);
    };

    mobileFxRef.current = setTimeout(runCycle, 1800);

    return () => {
      cancelled = true;
      if (mobileFxRef.current) clearTimeout(mobileFxRef.current);
    };
  }, [hasNoHover, isInView, scramble, text]);

  useEffect(() => {
    const shouldAnimateGradient = isInView && (isHovered || hasNoHover);

    if (!shouldAnimateGradient) {
      gradientControls.stop();
      void gradientControls.start({
        backgroundPosition: "0% center",
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      });
      return;
    }

    void gradientControls.start({
      backgroundPosition: ["0% center", "100% center"],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "mirror",
      },
    });
  }, [gradientControls, hasNoHover, isHovered, isInView]);

  const neonActive = isHovered || (hasNoHover && isInView);

  return (
    <div ref={titleRef} className="relative inline-block">
      <h1
        onMouseEnter={() => {
          setIsHovered(true);
          scramble(text);
        }}
        onMouseLeave={() => setIsHovered(false)}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight font-mono relative cursor-default"
      >
        <motion.span
          animate={gradientControls}
          className={cn(
            "bg-clip-text text-transparent bg-[length:220%_auto] bg-gradient-to-r from-cyan-200 via-cyan-300 to-violet-300 transition-[opacity,filter] duration-500 ease-out",
            neonActive
              ? "opacity-100 drop-shadow-[0_0_20px_rgba(167,139,250,0.28)]"
              : "opacity-90 drop-shadow-none",
          )}
        >
          {display}
        </motion.span>
      </h1>
    </div>
  );
};

// ─── Scroll Reveal ─────────────────────────────────────────────────────────────
const ScrollReveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [hasNoHover] = useState(() => hasNoHoverPointer());

  if (hasNoHover) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

// ─── Fade In (lightweight card entrance) ──────────────────────────────────────
const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const [hasNoHover] = useState(() => hasNoHoverPointer());

  if (hasNoHover) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

// ─── Fade Words (word-by-word entrance animation) ─────────────────────────────
const FadeWords = ({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * 0.06,
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn("inline-block mr-[0.25em]", wordClassName)}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// ─── Matter.js Physics Hook ───────────────────────────────────────────────────
const useMatterPhysics = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  items: { x: number; y: number }[],
) => {
  const [positions, setPositions] = useState<
    { x: number; y: number; angle: number }[]
  >(items.map((_, i) => ({ x: i * 80 + 80, y: 100, angle: 0 })));

  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const init = async () => {
      if (!containerRef.current) return;
      const Matter = (await import("matter-js")).default;
      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;
      const engine = Matter.Engine.create({
        gravity: { x: 0, y: 0, scale: 0 },
      });
      const world = engine.world;

      const getSize = () => ({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      let { width, height } = getSize();
      const bodyWidth = 140;
      const bodyHeight = 44;
      const halfBodyWidth = bodyWidth / 2;
      const halfBodyHeight = bodyHeight / 2;
      const wallThickness = 220;

      const walls = [
        Matter.Bodies.rectangle(
          width / 2,
          -wallThickness / 2,
          width * 2,
          wallThickness,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          width / 2,
          height + wallThickness / 2,
          width * 2,
          wallThickness,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          -wallThickness / 2,
          height / 2,
          wallThickness,
          height * 2,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          width + wallThickness / 2,
          height / 2,
          wallThickness,
          height * 2,
          { isStatic: true },
        ),
      ];
      Matter.World.add(world, walls);

      const bodies = items.map(() => {
        const px = 70 + Math.random() * (width - 140);
        const py = 50 + Math.random() * (height - 100);
        const body = Matter.Bodies.rectangle(px, py, bodyWidth, bodyHeight, {
          chamfer: { radius: 22 },
          restitution: 0.95,
          friction: 0.005,
          frictionAir: 0.015,
          density: 0.05,
        });
        Matter.Body.setInertia(body, Infinity);
        return body;
      });
      Matter.World.add(world, bodies);

      const mouse = Matter.Mouse.create(container);
      const wheelMouse = mouse as { mousewheel?: EventListener };
      if (wheelMouse.mousewheel) {
        mouse.element.removeEventListener("wheel", wheelMouse.mousewheel);
        mouse.element.removeEventListener(
          "DOMMouseScroll",
          wheelMouse.mousewheel,
        );
      }

      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      Matter.World.add(world, mouseConstraint);

      const releaseDraggedBody = () => {
        mouseConstraint.mouse.button = -1;
        const released = mouseConstraint as unknown as {
          body: unknown;
          constraint: { bodyB: unknown; pointB: unknown };
        };
        released.body = null;
        released.constraint.bodyB = null;
        released.constraint.pointB = null;
      };

      const isPointInsideContainer = (x: number, y: number) => {
        const rect = container.getBoundingClientRect();
        return (
          x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
        );
      };

      const handleTouchMove = (event: TouchEvent) => {
        const point = event.touches[0];
        if (!point) return;
        if (!isPointInsideContainer(point.clientX, point.clientY))
          releaseDraggedBody();
      };

      const clampBodyToBounds = (body: (typeof bodies)[number]) => {
        const minX = halfBodyWidth;
        const maxX = Math.max(halfBodyWidth, width - halfBodyWidth);
        const minY = halfBodyHeight;
        const maxY = Math.max(halfBodyHeight, height - halfBodyHeight);

        let nextX = body.position.x;
        let nextY = body.position.y;
        let nextVelX = body.velocity.x;
        let nextVelY = body.velocity.y;

        if (body.position.x < minX) {
          nextX = minX;
          nextVelX = Math.abs(body.velocity.x) * 0.55;
        } else if (body.position.x > maxX) {
          nextX = maxX;
          nextVelX = -Math.abs(body.velocity.x) * 0.55;
        }

        if (body.position.y < minY) {
          nextY = minY;
          nextVelY = Math.abs(body.velocity.y) * 0.55;
        } else if (body.position.y > maxY) {
          nextY = maxY;
          nextVelY = -Math.abs(body.velocity.y) * 0.55;
        }

        if (nextX !== body.position.x || nextY !== body.position.y) {
          Matter.Body.setPosition(body, { x: nextX, y: nextY });
          Matter.Body.setVelocity(body, { x: nextVelX, y: nextVelY });
        }
      };

      let animationFrameId = 0;
      let isActive = true;

      const updateSync = () => {
        if (!isActive || document.hidden) {
          animationFrameId = 0;
          return;
        }

        Matter.Engine.update(engine, 1000 / 60);
        bodies.forEach(clampBodyToBounds);
        setPositions(
          bodies.map((body) => ({
            x: body.position.x,
            y: body.position.y,
            angle: body.angle,
          })),
        );
        animationFrameId = requestAnimationFrame(updateSync);
      };

      const startLoop = () => {
        if (animationFrameId === 0 && isActive && !document.hidden) {
          animationFrameId = requestAnimationFrame(updateSync);
        }
      };

      const stopLoop = () => {
        if (animationFrameId !== 0) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      };

      startLoop();

      bodies.forEach((body) => {
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        });
      });

      let prevScroll = window.scrollY;
      let prevScrollTime = performance.now();
      const handleScrollMotion = () => {
        const now = performance.now();
        const deltaY = window.scrollY - prevScroll;
        const deltaTime = now - prevScrollTime;
        prevScroll = window.scrollY;
        prevScrollTime = now;

        const speed = Math.abs(deltaY) / Math.max(deltaTime, 16);
        const forceMag = Math.min(speed * 0.004, 0.6);
        if (forceMag <= 0.001) return;

        bodies.forEach((body) => {
          const randomX =
            (Math.random() - 0.5) * forceMag * (3.5 + Math.random() * 2);
          const randomY = (Math.random() - 0.5) * forceMag * 2.1;
          Matter.Body.applyForce(body, body.position, {
            x: randomX,
            y: randomY + (deltaY > 0 ? -forceMag : forceMag),
          });
        });
      };

      const handleResize = () => {
        const nextSize = getSize();
        width = nextSize.width;
        height = nextSize.height;
        Matter.Body.setPosition(walls[0], {
          x: width / 2,
          y: -wallThickness / 2,
        });
        Matter.Body.setPosition(walls[1], {
          x: width / 2,
          y: height + wallThickness / 2,
        });
        Matter.Body.setPosition(walls[2], {
          x: -wallThickness / 2,
          y: height / 2,
        });
        Matter.Body.setPosition(walls[3], {
          x: width + wallThickness / 2,
          y: height / 2,
        });
        bodies.forEach(clampBodyToBounds);
      };

      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          isActive = Boolean(entries[0]?.isIntersecting);
          if (isActive) startLoop();
          else stopLoop();
        },
        { threshold: 0.15 },
      );

      const handleVisibilityChange = () => {
        if (document.hidden) stopLoop();
        else if (isActive) startLoop();
      };

      visibilityObserver.observe(container);
      container.addEventListener("mouseleave", releaseDraggedBody);
      window.addEventListener("mouseup", releaseDraggedBody);
      window.addEventListener("touchend", releaseDraggedBody, {
        passive: true,
      });
      window.addEventListener("touchcancel", releaseDraggedBody, {
        passive: true,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("blur", releaseDraggedBody);
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScrollMotion, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange);

      teardown = () => {
        visibilityObserver.disconnect();
        container.removeEventListener("mouseleave", releaseDraggedBody);
        window.removeEventListener("mouseup", releaseDraggedBody);
        window.removeEventListener("touchend", releaseDraggedBody);
        window.removeEventListener("touchcancel", releaseDraggedBody);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("blur", releaseDraggedBody);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScrollMotion);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        stopLoop();
        Matter.Engine.clear(engine);
        Matter.World.clear(world, false);
      };
    };

    void init();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [containerRef, items]);

  return positions;
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasNoHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches,
  );
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, {
    margin: "-15% 0px -26% 0px",
    once: false,
  });

  return (
    <ScrollReveal className="mb-12">
      <p className="text-[10px] font-semibold text-zinc-600 tracking-[0.2em] mb-3 uppercase">
        {label}
      </p>
      <div
        ref={headerRef}
        onMouseEnter={() => {
          if (!hasNoHover) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!hasNoHover) setIsHovered(false);
        }}
        className="relative inline-block cursor-default"
      >
        <h2 className="text-4xl md:text-5xl font-semibold text-zinc-100 tracking-tight">
          {title}
        </h2>
        {/* Desktop: hover-reveal underline */}
        {!hasNoHover && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
          />
        )}
        {/* No-hover devices: always-visible underline with in-view emphasis */}
        {hasNoHover && (
          <motion.div
            initial={false}
            animate={{
              width: headerInView ? "100%" : "14%",
              opacity: headerInView ? 1 : 0.55,
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-cyan-300 via-violet-300 to-transparent shadow-[0_0_14px_rgba(139,92,246,0.45)]"
          />
        )}
      </div>
      {subtitle && (
        <p className="text-zinc-500 mt-4 text-base max-w-lg">{subtitle}</p>
      )}
      <div className="mt-8 h-[1px] bg-gradient-to-r from-zinc-800 via-zinc-800/40 to-transparent w-full" />
    </ScrollReveal>
  );
};

// ─── Activity Card (click to expand on mobile) ─────────────────────────────────
interface ActivityCardProps {
  title: string;
  role: string;
  description: string[];
  icon: React.ElementType;
  tags?: string[];
  highlight?: boolean;
}
const ActivityCard = ({
  title,
  role,
  description,
  icon: Icon,
  tags,
  highlight,
}: ActivityCardProps) => {
  const [isTouch] = useState(() => isTouchDevice());
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isOpen = (hovered && !isTouch) || expanded;

  return (
    <motion.div
      onMouseEnter={() => {
        if (!isTouch) setHovered(true);
      }}
      onMouseLeave={() => {
        if (!isTouch) setHovered(false);
      }}
      onClick={() => {
        if (isTouch) setExpanded((prev) => !prev);
      }}
      whileHover={!isTouch ? { y: -4, scale: 1.009 } : {}}
      whileTap={
        isTouch
          ? {
              scale: 0.992,
              boxShadow: "0 0 0 1px rgba(139,92,246,0.4)",
            }
          : undefined
      }
      // On mobile, add a subtle violet glow when the card enters view
      whileInView={
        isTouch
          ? {
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.2), 0 4px 24px rgba(139,92,246,0.07)",
            }
          : {}
      }
      viewport={{ once: false, margin: "-20%" }}
      transition={{ type: "spring", stiffness: 220, damping: 30 }}
      data-cursor="hover"
      className={cn(
        "relative p-7 rounded-3xl border overflow-hidden group shadow-lg cursor-pointer select-none",
        "border-white/5 bg-[#0a0a0a] hover:border-violet-500/35 active:ring-1 active:ring-violet-500/30",
        highlight && "hover:shadow-[0_0_28px_rgba(139,92,246,0.12)]",
      )}
    >
      <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_76%_14%,rgba(139,92,246,0.16)_0%,rgba(139,92,246,0.08)_28%,rgba(0,0,0,0)_62%)] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300",
              "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-violet-900/55 group-hover:border-violet-500/60 group-hover:text-violet-100",
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          {/* Expand / arrow indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 1 : 0.45 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "mt-1 text-zinc-500 group-hover:text-violet-300 transition-colors",
            )}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
        <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-sm font-medium text-zinc-400 mb-5">{role}</p>

        {/* Tap hint (only on touch, only when collapsed) */}
        <p className="text-[11px] text-zinc-600 mb-3 sm:hidden">
          {expanded ? "Tap to collapse" : "Tap to expand"}
        </p>

        <motion.div
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0,
            marginBottom: isOpen ? 8 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <ul className="space-y-3 text-sm text-zinc-500 pb-2">
            {description.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-2 w-1.5 h-1.5 rounded-full shrink-0",
                    highlight
                      ? "bg-violet-500/80 group-hover:bg-violet-300"
                      : "bg-zinc-600 group-hover:bg-violet-400/80",
                  )}
                />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        {tags && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors",
                  "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:border-violet-500/45 group-hover:text-violet-200",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Project Card ──────────────────────────────────────────────────────────────
interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
  link?: string;
  status?: string;
}
const ProjectCard = ({
  title,
  description,
  tags,
  icon: Icon,
  link,
  status,
}: ProjectCardProps) => (
  <motion.a
    href={link}
    onClick={(event) => {
      if (!link) event.preventDefault();
    }}
    target={link ? "_blank" : undefined}
    rel="noreferrer"
    whileHover={{ y: -5, scale: 1.014 }}
    whileTap={{ scale: 0.988, boxShadow: "0 0 0 1px rgba(139,92,246,0.4)" }}
    transition={{ type: "spring", stiffness: 380, damping: 23 }}
    data-cursor="hover"
    className={cn(
      "group relative flex flex-col p-7 rounded-3xl border border-white/5 bg-[#0a0a0a] overflow-hidden transition-all duration-500 shadow-lg h-full active:ring-1 active:ring-violet-500/30",
      "hover:border-violet-500/35",
      !link && "cursor-default",
    )}
  >
    <motion.div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    <div className="relative z-10 flex-1">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-violet-900/55 group-hover:text-violet-100 group-hover:border-violet-500/60 transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              {status}
            </span>
          )}
          {link && (
            <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-violet-200 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          )}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
        {description}
      </p>
    </div>
    <div className="relative z-10 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono group-hover:border-violet-500/40 group-hover:text-violet-200 transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  </motion.a>
);

interface TimelineItem {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const InteractiveTimeline = ({ items }: { items: TimelineItem[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 30%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800/80" />
      <motion.div
        className="absolute left-[19px] top-0 w-px origin-top bg-gradient-to-b from-cyan-300 via-indigo-400 to-violet-500"
        style={{ scaleY: lineScale, height: "100%" }}
      />

      <div className="space-y-5">
        {items.map((item, index) => {
          const TimelineIcon = item.icon;
          return (
            <ScrollReveal
              key={`${item.title}-${item.year}`}
              delay={index * 0.07}
            >
              <div className="group relative pl-14 pr-2">
                <div
                  className={cn(
                    "absolute left-[7px] top-7 w-6 h-6 rounded-full border flex items-center justify-center backdrop-blur-lg transition-colors",
                    item.highlight
                      ? "border-zinc-600 bg-zinc-900 text-zinc-300 group-hover:border-violet-400/70 group-hover:bg-violet-500/20 group-hover:text-violet-200"
                      : "border-zinc-600 bg-zinc-900 text-zinc-300 group-hover:border-violet-400/70 group-hover:bg-violet-500/18 group-hover:text-violet-200",
                  )}
                >
                  <TimelineIcon className="w-3.5 h-3.5" />
                </div>
                <div
                  className={cn(
                    "rounded-3xl border p-5 md:p-6 transition-colors",
                    item.highlight
                      ? "border-white/5 bg-[#0b0b0b] group-hover:border-violet-500/35 group-hover:bg-violet-950/18"
                      : "border-white/5 bg-[#0b0b0b] group-hover:border-violet-500/35 group-hover:bg-violet-950/12",
                  )}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="text-sm font-semibold text-zinc-200 tracking-tight">
                      {item.title}
                    </p>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
};

// ─── Certification Card ────────────────────────────────────────────────────────
interface CertProps {
  title: string;
  issuer: string;
  year: string;
  link: string;
  icon: React.ElementType;
  highlight?: boolean;
}
const CertCard = ({ title, issuer, year, link, icon: Icon }: CertProps) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noreferrer"
    whileHover={{ x: 6 }}
    transition={{ type: "spring", stiffness: 300, damping: 26 }}
    data-cursor="hover"
    className={cn(
      "group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl border transition-all duration-300",
      "border-white/5 bg-[#0a0a0a] hover:border-violet-500/40 hover:bg-violet-950/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]",
    )}
  >
    <div
      className={cn(
        "w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300",
        "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-violet-600 group-hover:border-violet-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]",
      )}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0 w-full group-hover:translate-x-1 transition-transform duration-300">
      <p className="text-base font-bold text-zinc-100 mb-1 leading-snug group-hover:text-violet-50 transition-colors">
        {title}
      </p>
      <p className="text-sm text-zinc-400 group-hover:text-violet-300/60 transition-colors">
        {issuer}
      </p>
      <div className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500 group-hover:text-violet-200 transition-colors">
        View credential
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>
    <span className="text-xs text-zinc-600 font-mono font-medium shrink-0 self-start sm:self-center group-hover:text-violet-400 transition-colors">
      {year}
    </span>
  </motion.a>
);

// ─── Data ──────────────────────────────────────────────────────────────────────
const activities: ActivityCardProps[] = [
  {
    title: "PoliNetwork",
    role: "Product & Operations Lead",
    icon: Network,
    highlight: true,
    description: [
      "Architecting a robust open-source web ecosystem serving thousands of students.",
      "Scaling technical operations for massive events gathering 1,000+ people.",
      "Leading cross-functional student engineering teams and managing active sprints.",
      "Defining product vision and executing long-term roadmaps.",
    ],
    tags: ["Leadership", "System Architecture", "Agile", "Open Source"],
  },
  {
    title: "Digital Craftsmanship",
    role: "Design & Frontend Engineering",
    icon: Layers,
    description: [
      "Bridging the gap between engineering complexity and polished interfaces.",
      "Prototyping dynamic flows in Figma before writing a single line of code.",
      "Obsessing over kinetic typography, physics animations, and micro-interactions.",
    ],
    tags: ["React", "Framer Motion", "Figma", "TypeScript"],
  },
  {
    title: "Homelab Infrastructure",
    role: "Sysadmin & Architecture",
    icon: Server,
    description: [
      "Self-hosting complex environments with high availability.",
      "Configuring Proxmox hypervisor, TrueNAS storage arrays, and containerized apps.",
      "Automating deployments, setting up reverse proxies, and maintaining zero-trust VLANs.",
    ],
    tags: ["Proxmox", "Docker", "Linux", "Networking"],
  },
  {
    title: "Systems Programming",
    role: "Low-Level Engineering",
    icon: Cpu,
    description: [
      "Writing performant C code for systems and embedded contexts.",
      "Mastering memory management, custom data structures, and algorithm design.",
      "Deep dive into OS fundamentals: scheduling, process synchronization, IPC.",
    ],
    tags: ["C", "POSIX", "GDB", "Make"],
  },
];

const projects: ProjectCardProps[] = [
  {
    title: "PoliNetwork Ecosystem",
    description:
      "An expansive open-source web platform serving the Politecnico di Milano student body. Built for high performance and scalability under load during massive university events.",
    tags: ["React", "Node.js", "Docker", "PostgreSQL"],
    icon: Globe,
    link: "https://github.com/PoliNetwork",
    status: "PRODUCTION",
  },
  {
    title: "Personal Infrastructure",
    description:
      "A production-grade, self-hosted data center running in my home. Leveraging Proxmox VMs, TrueNAS storage, Traefik ingress, and comprehensive Grafana observability dashboards.",
    tags: ["Proxmox", "TrueNAS", "Traefik", "Prometheus"],
    icon: HardDrive,
    status: "SYSADMIN",
  },
  {
    title: "Interactive Portfolio",
    description:
      "A performance-obsessed, design-forward website featuring a full 2D physics sandbox using Matter.js, kinetic typography, and fluid Framer Motion animations.",
    tags: ["React", "Matter.js", "Vite", "Tailwind"],
    icon: Code2,
    link: "https://github.com/viganogabriele",
    status: "V2 LIVE",
  },
];

const certifications: CertProps[] = [
  {
    title: "Leadership & Project Management",
    issuer: "PoliNetwork APS – Student Association",
    year: "2024",
    link: "https://polinetwork.org",
    icon: Award,
    highlight: true,
  },
  {
    title: "Public Speaking & Communication",
    issuer: "Politecnico di Milano",
    year: "2024",
    link: "https://www.polimi.it",
    icon: Mic2,
  },
  {
    title: "Team Coordination Dynamics",
    issuer: "IEEE Student Branch",
    year: "2023",
    link: "https://www.ieee.org",
    icon: Users,
  },
];

const timelineItems: TimelineItem[] = [
  {
    year: "2026",
    title: "Interactive Portfolio v3",
    subtitle: "Design Engineering",
    description:
      "Evolved the portfolio into a motion-led digital experience with physics interactions, custom preloading, and cinematic transitions.",
    icon: Code2,
    highlight: true,
  },
  {
    year: "2025",
    title: "PoliNetwork Product Ops",
    subtitle: "Leadership",
    description:
      "Orchestrated product direction and engineering operations across student-facing platforms with high traffic windows.",
    icon: Network,
    highlight: true,
  },
  {
    year: "2024",
    title: "Homelab Infrastructure",
    subtitle: "Systems Architecture",
    description:
      "Designed a resilient self-hosted environment with virtualization, observability, and secure networking practices.",
    icon: Server,
  },
  {
    year: "2023",
    title: "Low-Level Foundations",
    subtitle: "Systems Programming",
    description:
      "Consolidated C, OS internals and debugging workflows focused on performance, memory, and reliability.",
    icon: Cpu,
  },
];

interface NoteItem {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  preview: string;
  tags: string[];
  body: string[];
}

const notes: NoteItem[] = [
  {
    slug: "motion-performance",
    title: "Designing Motion Without Sacrificing Performance",
    date: "Apr 2026",
    readingTime: "6 min",
    preview:
      "A practical approach to balancing animated UI, physics, and frame budget in React-driven interfaces.",
    tags: ["Performance", "Framer Motion", "UX"],
    body: [
      "Premium motion should feel effortless, not heavy. The first constraint is always frame budget: every animation in the scene competes for the same rendering pipeline.",
      "For interactive portfolios, I separate decorative motion from interaction-critical motion. Decorative layers run with gentle timings and low update pressure, while interaction layers get strict spring constraints and shorter lifecycles.",
      "When physics is involved, containment and fallback behavior matter more than visual novelty. If drag escapes bounds on mobile, the experience breaks trust. Robust constraints and release safety are part of UX quality.",
    ],
  },
  {
    slug: "student-platform-peak-load",
    title: "Operating Student Platforms at Peak Load",
    date: "Mar 2026",
    readingTime: "7 min",
    preview:
      "Lessons learned from product and operations decisions across student-facing systems during high-traffic events.",
    tags: ["Architecture", "Ops", "Product"],
    body: [
      "Traffic spikes expose unclear ownership before they expose weak servers. During event windows, incident response quality depends on team clarity and pre-defined runbooks.",
      "I prioritize observability that answers product questions, not just infrastructure metrics. Knowing which flows degrade first helps protect the user journey when capacity gets tight.",
      "Post-event reviews should produce action items tied to product and engineering together. Reliability is a roadmap outcome, not just an ops task.",
    ],
  },
  {
    slug: "homelab-patterns-scale",
    title: "Homelab Patterns That Scale Better",
    date: "Feb 2026",
    readingTime: "5 min",
    preview:
      "A concise checklist for virtualization, observability and network segmentation in a resilient personal infrastructure.",
    tags: ["Infrastructure", "Linux", "Observability"],
    body: [
      "The most useful homelab design principle is graceful degradation. Services should fail independently, with clear boundaries between storage, compute and ingress.",
      "Segmenting workloads by criticality simplifies maintenance windows and lowers recovery time. Monitoring should include service-level checks, not only host-level signals.",
      "A small but disciplined platform can outperform a complex one: fewer moving parts, clearer backups, and repeatable deployment flows.",
    ],
  },
];

const noteBySlug = new Map(notes.map((note) => [note.slug, note]));

const skills = [
  { label: "JavaScript", icon: Code2, color: "#F7DF1E", x: 100, y: 100 },
  { label: "HTML", icon: Globe, color: "#E44D26", x: 300, y: 150 },
  { label: "CSS", icon: Palette, color: "#5C6BC0", x: 500, y: 120 },
  { label: "C", icon: Terminal, color: "#a8b9cc", x: 200, y: 250 },
  { label: "Git", icon: GitMerge, color: "#F05032", x: 450, y: 280 },
  { label: "Linux", icon: Terminal, color: "#fcc624", x: 650, y: 180 },
  { label: "Proxmox", icon: Server, color: "#E57000", x: 350, y: 80 },
  { label: "TrueNAS", icon: HardDrive, color: "#0095D5", x: 600, y: 250 },
  { label: "Figma", icon: FigmaIcon, color: "#A259FF", x: 700, y: 100 },
];

const Footer = ({ onNavigate }: { onNavigate: (target: string) => void }) => {
  const links = [
    {
      label: "GitHub",
      username: "viganogabriele",
      href: "https://github.com/viganogabriele",
      icon: GithubIcon,
    },
    {
      label: "LinkedIn",
      username: "viganogabriele",
      href: "https://linkedin.com/in/viganogabriele",
      icon: LinkedinIcon,
    },
  ];

  return (
    <ScrollReveal delay={0.1}>
      <footer className="mt-40 pb-20 border-t border-white/[0.06] relative overflow-hidden">
        <div className="pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
          {/* About block */}
          <div className="flex flex-col items-start gap-6">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              About
            </p>
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-medium tracking-tight text-zinc-400">
                Gabriele Viganò
              </p>
              <a
                href="mailto:info@viganogabriele.com"
                className="text-sm font-medium tracking-tight text-zinc-400 hover:text-white transition-colors group flex items-center gap-2"
              >
                info@viganogabriele.com
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Nav Links - Quick Access */}
          <div className="flex flex-col gap-6">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Navigation
            </p>
            <nav className="grid grid-cols-2 gap-y-3 gap-x-6">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(l.href);
                  }}
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Socials & Handles */}
          <div className="flex flex-col gap-6 lg:items-end">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest lg:text-right">
              Social Profiles
            </p>
            <div className="flex flex-col gap-4 lg:items-end">
              {links.map(({ label, username, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="hover"
                  className="flex items-center gap-4 text-zinc-400 hover:text-white transition-all duration-300 group"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {label}
                    </span>
                    <span className="text-sm font-medium tracking-tight">
                      @{username}
                    </span>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-violet-600 group-hover:border-violet-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <Icon className="w-5 h-5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-20 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-600 font-mono tracking-wider uppercase">
            © {new Date().getFullYear()} Gabriele Viganò. All rights reserved.
          </p>
          <p className="text-[11px] text-zinc-600 font-mono tracking-wider uppercase">
            Made with React & Framer Motion
          </p>
        </div>
      </footer>
    </ScrollReveal>
  );
};

const Preloader = ({
  progress,
  simplifyExit,
}: {
  progress: number;
  simplifyExit: boolean;
}) => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={simplifyExit ? { opacity: 0 } : { opacity: 0, filter: "blur(18px)" }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center gpu-promote"
  >
    <div className="w-[min(28rem,82vw)] flex flex-col items-center gap-7">
      <motion.img
        src={logo}
        alt="Loading"
        className="h-9 w-auto opacity-90 filter invert"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 0.9 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="w-full h-[2px] rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-300 via-white to-indigo-300"
          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between w-full text-[11px] uppercase tracking-[0.28em] font-medium text-zinc-400">
        <span>Loading Experience</span>
        <span>{String(Math.round(progress)).padStart(3, "0")}</span>
      </div>
    </div>
  </motion.div>
);

const SectionContainer = ({
  id,
  className,
  isActive,
  children,
}: {
  id: string;
  className?: string;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <section id={id} className={cn("relative", className)}>
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[2rem]"
      animate={{
        opacity: isActive ? 1 : 0,
        boxShadow: isActive
          ? "inset 0 0 60px rgba(139,92,246,0.05), 0 0 0 1px rgba(139,92,246,0.18)"
          : "inset 0 0 0 rgba(139,92,246,0), 0 0 0 1px rgba(139,92,246,0)",
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
    <div className="relative z-10">{children}</div>
  </section>
);

const AmbientBackground = ({
  topOpacity,
  bottomOpacity,
  mobileBoost = false,
}: {
  topOpacity?: MotionValue<number>;
  bottomOpacity?: MotionValue<number>;
  mobileBoost?: boolean;
}) => {
  if (mobileBoost) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ambient-layer gpu-promote">
        <div className="absolute inset-0 bg-[radial-gradient(88%_62%_at_50%_4%,rgba(56,189,248,0.18),rgba(0,0,0,0)_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_56%_at_50%_96%,rgba(167,139,250,0.22),rgba(0,0,0,0)_74%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,rgba(15,23,42,0.20),rgba(0,0,0,0)_70%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ambient-layer gpu-promote">
      {topOpacity ? (
        <motion.div
          aria-hidden
          style={{ opacity: topOpacity }}
          className="absolute inset-0 ambient-blob bg-[radial-gradient(70%_55%_at_50%_8%,rgba(56,189,248,0.35),rgba(0,0,0,0)_70%)]"
        />
      ) : null}
      {bottomOpacity ? (
        <motion.div
          aria-hidden
          style={{ opacity: bottomOpacity }}
          className="absolute inset-0 ambient-blob bg-[radial-gradient(62%_50%_at_50%_92%,rgba(139,92,246,0.3),rgba(0,0,0,0)_72%)]"
        />
      ) : null}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[80px] sm:blur-[140px] ambient-blob opacity-40" />
      <div className="absolute top-[30%] left-[-18%] w-[52%] h-[52%] rounded-full bg-cyan-500/18 blur-[90px] sm:blur-[160px] ambient-blob opacity-35" />
      <div className="absolute bottom-[12%] left-[-12%] w-[46%] h-[46%] rounded-full bg-sky-500/15 blur-[80px] sm:blur-[140px] ambient-blob opacity-35" />
      <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/25 blur-[90px] sm:blur-[150px] ambient-blob opacity-35" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/20 blur-[80px] sm:blur-[130px] ambient-blob opacity-35" />
    </div>
  );
};

// ─── App ────────────────────────────────────────────────────────────────────────
function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const [isTouch] = useState(() => isTouchDevice());
  const [hasNoHover] = useState(() => hasNoHoverPointer());
  const [isTelegramWebView] = useState(() => isTelegramBrowser());
  const { scrollYProgress } = useScroll();
  const disableMobileScrollFx =
    prefersReducedMotion || isTouch || hasNoHover || isTelegramWebView;
  const boostMobileAmbient = isTouch || hasNoHover;
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const bgShiftTop = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    boostMobileAmbient ? [0.09, 0.2, 0.11] : [0.02, 0.1, 0.04],
  );
  const bgShiftBottom = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    boostMobileAmbient ? [0.1, 0.18, 0.24] : [0.03, 0.08, 0.14],
  );

  const [isPreloading, setIsPreloading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const lenisRef = useRef<LenisInstance | null>(null);

  const playgroundRef = useRef<HTMLDivElement>(null);
  const physicsPositions = useMatterPhysics(playgroundRef, skills);

  useEffect(() => {
    let raf = 0;
    let timeout = 0;
    let mounted = true;
    let progress = 0;

    const tick = () => {
      progress = Math.min(92, progress + (92 - progress) * 0.08 + 0.35);
      if (mounted) setLoadingProgress(progress);
      if (progress < 91.8) raf = requestAnimationFrame(tick);
    };

    const waitForAssets = async () => {
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const pendingImages = Array.from(document.images)
        .filter((image) => !image.complete)
        .map(
          (image) =>
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
        );

      await Promise.all([
        fontsReady,
        ...pendingImages,
        new Promise((resolve) => setTimeout(resolve, 450)),
      ]);

      if (!mounted) return;
      cancelAnimationFrame(raf);
      setLoadingProgress(100);
      timeout = window.setTimeout(
        () => mounted && setIsPreloading(false),
        prefersReducedMotion ? 120 : 450,
      );
    };

    raf = requestAnimationFrame(tick);
    waitForAssets();

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (disableMobileScrollFx) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    let disposed = false;
    let raf = 0;
    let destroyLenis: (() => void) | null = null;

    const setupLenis = async () => {
      const { default: Lenis } = await import("lenis");
      if (disposed) return;

      const lenis = new Lenis({
        duration: 1.1,
        lerp: 0.09,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
      });

      lenisRef.current = lenis;
      const run = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(run);
      };
      raf = requestAnimationFrame(run);
      destroyLenis = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
        lenisRef.current = null;
      };
    };

    void setupLenis();

    return () => {
      disposed = true;
      destroyLenis?.();
    };
  }, [disableMobileScrollFx]);

  useEffect(() => {
    document.body.style.overflow = isPreloading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPreloading]);

  const scrollToSection = useCallback(
    (target: string) => {
      const selector = target === "body" ? "body" : target;
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return;

      if (selector !== "body") {
        element.animate(
          [
            { filter: "brightness(1)", transform: "translateY(0px)" },
            { filter: "brightness(1.2)", transform: "translateY(-2px)" },
            { filter: "brightness(1)", transform: "translateY(0px)" },
          ],
          {
            duration: 420,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
      }

      if (lenisRef.current && !prefersReducedMotion) {
        lenisRef.current.scrollTo(element, { offset: -100, duration: 1.1 });
        return;
      }

      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    },
    [prefersReducedMotion],
  );

  return (
    <>
      <PageMeta
        title="Gabriele Vigano | Computer Engineering Student"
        description="Portfolio of Gabriele Vigano: design engineering, product operations, and infrastructure projects."
        path="/"
      />
      <JsonLd
        id="website-person"
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "Gabriele Vigano",
              url: SITE_URL,
              description:
                "Portfolio focused on design engineering, product operations, and infrastructure.",
            },
            {
              "@type": "Person",
              name: "Gabriele Vigano",
              url: SITE_URL,
              sameAs: [
                "https://github.com/viganogabriele",
                "https://linkedin.com/in/viganogabriele",
              ],
              jobTitle: "Computer Engineering Student",
            },
          ],
        }}
      />
      <AnimatePresence>
        {isPreloading ? (
          <Preloader
            progress={loadingProgress}
            simplifyExit={
              isTouch || isTelegramWebView || !!prefersReducedMotion
            }
          />
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "noise min-h-screen text-zinc-300 selection:bg-violet-900/40 selection:text-white",
          boostMobileAmbient ? "bg-[#090b14]" : "bg-[#060606]",
          isTelegramWebView && "telegram-safe",
        )}
        style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
      >
        <ScrollBar />
        <CustomCursor />
        <Navbar onNavigate={scrollToSection} />

        <AmbientBackground
          topOpacity={boostMobileAmbient ? undefined : bgShiftTop}
          bottomOpacity={boostMobileAmbient ? undefined : bgShiftBottom}
          mobileBoost={boostMobileAmbient}
        />

        <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <motion.section
            className="min-h-[100vh] flex flex-col md:flex-row items-center justify-between pt-36 sm:pt-40 md:pt-28 pb-16 gap-10 md:gap-12"
            style={
              disableMobileScrollFx
                ? undefined
                : { y: heroY, opacity: heroOpacity }
            }
          >
            {/* Mobile-first portrait */}
            <motion.div
              className="order-1 md:order-2 flex-1 flex justify-center md:justify-end"
              initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.4,
              }}
            >
              <FloatingPortrait />
            </motion.div>

            {/* Left Content */}
            <div className="order-2 md:order-1 flex-1 flex flex-col items-start text-left z-10 w-full mb-10 md:mb-0">
              <div>
                <h2 className="text-2xl sm:text-3xl text-zinc-400 font-medium tracking-tight mb-2">
                  <FadeWords text="Hey, I'm" delay={0.3} />
                  <FadeWords
                    text="Gabriele Viganò."
                    delay={0.45}
                    wordClassName="text-white font-bold"
                  />
                </h2>
                <TextScramble text="I build cool things." />
              </div>

              <div className="mt-8">
                <KineticTag />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-4 mt-10"
              >
                <Magnetic strength={0.2}>
                  <a
                    href="#expertise"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("#expertise");
                    }}
                    data-cursor="hover"
                    className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  >
                    Explore my work
                  </a>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a
                    href="https://github.com/viganogabriele"
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="hover"
                    className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                  >
                    <GithubIcon className="w-5 h-5" />
                  </a>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <a
                    href="https://linkedin.com/in/viganogabriele"
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="hover"
                    className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                  >
                    <LinkedinIcon className="w-5 h-5" />
                  </a>
                </Magnetic>
              </motion.div>
            </div>
          </motion.section>

          {/* ── About ─────────────────────────────────────────────────── */}
          <SectionContainer id="about" className="mt-28 pt-16" isActive={false}>
            <ScrollReveal>
              <div className="relative py-2 md:py-4">
                <motion.div
                  aria-hidden
                  animate={{ x: [0, 16, 0], y: [0, -12, 0] }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -left-10 h-40 w-40 rounded-full bg-cyan-500/16 blur-3xl"
                />
                <motion.div
                  aria-hidden
                  animate={{ x: [0, -16, 0], y: [0, 10, 0] }}
                  transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-8 right-2 h-44 w-44 rounded-full bg-violet-500/14 blur-3xl"
                />

                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    01 / About
                  </p>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.985, filter: "brightness(1.15)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent"
                  >
                    I build serious things, without being too serious.
                  </motion.h3>
                  <p className="text-zinc-300 leading-relaxed text-base md:text-[17px] max-w-3xl">
                    I blend product operations, frontend engineering and
                    infrastructure into fast, reliable experiences. Build, test,
                    refine, repeat.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </SectionContainer>

          {/* ── What I Do ─────────────────────────────────────────────── */}
          <SectionContainer
            id="expertise"
            className="mt-32 pt-20"
            isActive={false}
          >
            <SectionHeader
              label="02 / Expertise"
              title="What I Do."
              subtitle="I build systems that perform reliably and interfaces that feel incredible."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act, i) => (
                <FadeIn key={act.title} delay={i * 0.08}>
                  <ActivityCard {...act} />
                </FadeIn>
              ))}
            </div>
          </SectionContainer>

          {/* ── Projects ──────────────────────────────────────────────── */}
          <SectionContainer
            id="projects"
            className="mt-40 pt-20"
            isActive={false}
          >
            <SectionHeader
              label="03 / Selected Work"
              title="Featured Projects."
              subtitle="Real-world systems, open-source tech, and experimental playgrounds."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((proj, i) => (
                <FadeIn key={proj.title} delay={i * 0.08}>
                  <ProjectCard {...proj} />
                </FadeIn>
              ))}
            </div>
          </SectionContainer>

          {/* ── Skills Playground (Physics Sandbox) ───────────────────── */}
          <SectionContainer id="stack" className="mt-40 pt-20" isActive={false}>
            <SectionHeader
              label="04 / The Toolkit"
              title="Tech Stack."
              subtitle="Grab them, throw them, watch them bounce — powered by Matter.js."
            />
            <ScrollReveal>
              <div
                ref={playgroundRef}
                data-cursor-bubble="true"
                className="relative w-full h-[550px] sm:h-[450px] rounded-[2rem] border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl touch-pan-y"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.025) 2px, transparent 2px)",
                  backgroundSize: "40px 40px",
                }}
              >
                {/* Mobile Interaction Shield - shows message or hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none sm:hidden">
                  <p className="text-[10px] text-zinc-500 font-mono bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                    Drag icons to play • Scroll outside to move
                  </p>
                </div>
                {skills.map((skill, i) => {
                  const pos = physicsPositions[i] || {
                    x: -100,
                    y: -100,
                    angle: 0,
                  };
                  return (
                    <div
                      key={skill.label}
                      className="absolute top-0 left-0 flex items-center justify-center gap-2.5 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-medium text-[14px] select-none touch-none shadow-lg cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors active:ring-1 active:ring-violet-500/30"
                      style={{
                        transform: `translate(${pos.x - 70}px, ${pos.y - 22}px) rotate(${pos.angle}rad)`,
                        width: "140px",
                        height: "44px",
                      }}
                    >
                      <skill.icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: skill.color }}
                      />
                      {skill.label}
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </SectionContainer>

          {/* ── Interactive Timeline ───────────────────────────────────── */}
          <SectionContainer
            id="journey"
            className="mt-40 pt-20"
            isActive={false}
          >
            <SectionHeader
              label="04 / Journey"
              title="Interactive Timeline."
              subtitle="Key moments that shaped my product, systems, and design engineering path."
            />
            <InteractiveTimeline items={timelineItems} />
          </SectionContainer>

          {/* ── Notes ─────────────────────────────────────────────────── */}
          <SectionContainer id="notes" className="mt-40 pt-20" isActive={false}>
            <SectionHeader
              label="05 / Notes"
              title="Engineering Notes."
              subtitle="Short technical writes on motion systems, architecture decisions, and infrastructure operations."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notes.map((note, i) => (
                <FadeIn key={note.title} delay={i * 0.07}>
                  <motion.div
                    data-cursor="hover"
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{
                      scale: 0.99,
                      boxShadow: "0 0 0 1px rgba(139,92,246,0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="group h-full flex flex-col rounded-3xl border border-white/5 bg-[#0a0a0a] p-6 hover:border-violet-500/35 transition-colors active:ring-1 active:ring-violet-500/30"
                  >
                    <Link to={`/notes/${note.slug}`} className="contents">
                      <div className="flex items-center justify-between mb-4 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        <span>{note.date}</span>
                        <span>{note.readingTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-100 tracking-tight mb-3">
                        {note.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-5 flex-1">
                        {note.preview}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono group-hover:border-violet-500/40 group-hover:text-violet-200 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </SectionContainer>

          {/* ── Certifications ─────────────────────────────────────────── */}
          <SectionContainer
            id="certifications"
            className="mt-40 pt-20"
            isActive={false}
          >
            <SectionHeader
              label="06 / Recognition"
              title="Certifications."
              subtitle="Investing in leadership depth and effective communication."
            />
            <div className="flex flex-col gap-4">
              {certifications.map((cert, i) => (
                <FadeIn key={cert.title} delay={i * 0.08}>
                  <CertCard {...cert} />
                </FadeIn>
              ))}
            </div>
          </SectionContainer>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <Footer onNavigate={scrollToSection} />
        </main>
      </div>
    </>
  );
}

const ContentShell = ({ children }: { children: React.ReactNode }) => {
  const [isTouch] = useState(() => isTouchDevice());
  const [hasNoHover] = useState(() => hasNoHoverPointer());
  const boostMobileAmbient = isTouch || hasNoHover;

  return (
    <div
      className={cn(
        "noise min-h-screen text-zinc-300 selection:bg-violet-900/40 selection:text-white",
        boostMobileAmbient ? "bg-[#090b14]" : "bg-[#060606]",
        isTelegramBrowser() && "telegram-safe",
      )}
      style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
    >
      <CustomCursor />
      <AmbientBackground mobileBoost={boostMobileAmbient} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const NoteDetailPage = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [isTelegramWebView] = useState(() => isTelegramBrowser());
  const note = noteBySlug.get(slug);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  if (!note) return <Navigate to="/" replace />;

  return (
    <ContentShell>
      <PageMeta
        title={`${note.title} | Gabriele Vigano`}
        description={note.preview}
        path={`/notes/${note.slug}`}
      />
      <JsonLd
        id={`note-${note.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: note.title,
          description: note.preview,
          datePublished: `2026-${note.slug === "motion-performance" ? "04" : note.slug === "student-platform-peak-load" ? "03" : "02"}-01`,
          author: {
            "@type": "Person",
            name: "Gabriele Vigano",
          },
          mainEntityOfPage: `${SITE_URL}/notes/${note.slug}`,
        }}
      />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 mb-8 rounded-full border border-white/[0.08] px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-zinc-300 hover:text-white transition-colors"
          style={{
            background: "rgba(8, 6, 14, 0.45)",
            backdropFilter: isTelegramWebView
              ? "none"
              : "blur(28px) saturate(180%)",
            WebkitBackdropFilter: isTelegramWebView
              ? "none"
              : "blur(28px) saturate(180%)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}
        >
          <span aria-hidden>←</span>
          Back
        </button>
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500 mb-3">
          {note.date} • {note.readingTime}
        </p>
        <h1 className="text-4xl md:text-5xl text-zinc-100 font-semibold tracking-tight mb-8">
          {note.title}
        </h1>
        <div className="space-y-5 text-zinc-300 leading-relaxed text-[17px]">
          {note.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </main>
    </ContentShell>
  );
};

const NotFoundPage = () => (
  <ContentShell>
    <PageMeta
      title="Page Not Found | Gabriele Vigano"
      description="The page you are looking for does not exist."
      path="/404"
    />
    <main className="max-w-3xl mx-auto px-6 min-h-screen flex flex-col items-start justify-center">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4">
        404
      </p>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100 mb-4">
        Page not found.
      </h1>
      <p className="text-zinc-400 max-w-xl mb-8 leading-relaxed">
        The requested URL is not available. You can return to the landing page.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
        >
          Back to landing page
        </Link>
      </div>
    </main>
  </ContentShell>
);

const RouteTransitionController = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const id = location.hash;
    const frame = window.requestAnimationFrame(() => {
      const section = document.querySelector<HTMLElement>(id);
      if (!section) return;
      const y = section.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return null;
};

const AppRoutes = () => (
  <>
    <RouteTransitionController />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/index.html" element={<HomePage />} />
      <Route path="/viganogabriele.com" element={<HomePage />} />
      <Route path="/viganogabriele.com/" element={<HomePage />} />
      <Route path="/viganogabriele.com/index.html" element={<HomePage />} />
      <Route path="/notes/:slug" element={<NoteDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

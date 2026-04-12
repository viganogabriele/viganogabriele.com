import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import {
  Mail,
  Network,
  Server,
  Terminal,
  Palette,
  Code2,
  GitMerge,
  ArrowUpRight,
  Layers,
  Cpu,
  Globe,
  HardDrive,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import portrait from './assets/portrait.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GithubIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path>
  </svg>
);

const LinkedinIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const FigmaIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Custom Cursor
// ─────────────────────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(mouseX, { stiffness: 120, damping: 18, mass: 0.8 });
  const ringY = useSpring(mouseY, { stiffness: 120, damping: 18, mass: 0.8 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleHoverEnter = () => setHovering(true);
    const handleHoverLeave = () => setHovering(false);

    window.addEventListener('mousemove', move);

    const addListeners = () => {
      document.querySelectorAll('a, button, [data-cursor="hover"], [draggable]').forEach((el) => {
        el.addEventListener('mouseenter', handleHoverEnter);
        el.addEventListener('mouseleave', handleHoverLeave);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', move);
      observer.disconnect();
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <motion.div
        ref={ringRef}
        className={cn('cursor-ring', hovering && 'hovering')}
        style={{ left: ringX, top: ringY }}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Magnetic Wrapper
// ─────────────────────────────────────────────────────────────────────────────
const Magnetic = ({
  children,
  strength = 0.25,
}: {
  children: React.ReactElement;
  strength?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    x.set((e.clientX - midX) * strength);
    y.set((e.clientY - midY) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Text Scramble
// ─────────────────────────────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
const PHRASES = ['Building Systems', 'Designing Experiences'];

const useTextScramble = () => {
  const [displayText, setDisplayText] = useState(PHRASES[0]);
  const [, setPhraseIndex] = useState(0);
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iterationsRef = useRef(0);

  const scramble = useCallback(
    (target: string, onDone?: () => void) => {
      const totalFrames = 18;
      iterationsRef.current = 0;

      const tick = () => {
        iterationsRef.current += 1;
        const progress = iterationsRef.current / totalFrames;

        setDisplayText(
          target
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' ';
              if (i / target.length < progress) return char;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );

        if (iterationsRef.current < totalFrames) {
          frameRef.current = setTimeout(tick, 40);
        } else {
          setDisplayText(target);
          onDone?.();
        }
      };

      tick();
    },
    []
  );

  useEffect(() => {
    // Initial scramble on mount
    scramble(PHRASES[0]);

    const interval = setInterval(() => {
      setPhraseIndex((prev) => {
        const next = (prev + 1) % PHRASES.length;
        scramble(PHRASES[next]);
        return next;
      });
    }, 3500);

    return () => {
      clearInterval(interval);
      if (frameRef.current) clearTimeout(frameRef.current);
    };
  }, [scramble]);

  return displayText;
};

// ─────────────────────────────────────────────────────────────────────────────
// Scroll Reveal Wrapper
// ─────────────────────────────────────────────────────────────────────────────
const revealVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
      delay,
    },
  }),
};

const ScrollReveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    variants={revealVariants}
    custom={delay}
  >
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Draggable Skill Bubble
// ─────────────────────────────────────────────────────────────────────────────
const DraggableBubble = ({
  label,
  icon: Icon,
  initialX,
  initialY,
  color,
}: {
  label: string;
  icon: React.ElementType;
  initialX: number;
  initialY: number;
  color?: string;
}) => {
  return (
    <motion.div
      drag
      dragMomentum={true}
      dragElastic={0.1}
      dragTransition={{ power: 0.3, timeConstant: 200 }}
      initial={{ x: initialX, y: initialY, scale: 0, opacity: 0 }}
      animate={{ x: initialX, y: initialY, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: Math.random() * 0.4 }}
      whileDrag={{ scale: 1.12, zIndex: 100, cursor: 'grabbing' }}
      whileHover={{ scale: 1.06 }}
      data-cursor="hover"
      className="absolute flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-md text-zinc-200 font-medium text-sm select-none touch-none"
      style={{ cursor: 'grab' }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: color ?? '#a1a1aa' }} />
      {label}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// What I Do Card
// ─────────────────────────────────────────────────────────────────────────────
interface ActivityCardProps {
  title: string;
  role: string;
  description: string[];
  icon: React.ElementType;
  tags?: string[];
}

const ActivityCard = ({ title, role, description, icon: Icon, tags }: ActivityCardProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      data-cursor="hover"
      className="relative p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm overflow-hidden group"
    >
      {/* Subtle corner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpRight className="w-4 h-4 text-zinc-500" />
          </motion.div>
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 tracking-tight mb-1">{title}</h3>
        <p className="text-sm font-medium text-zinc-500 mb-4">{role}</p>

        <motion.div
          initial={false}
          animate={{ height: hovered ? 'auto' : 0, opacity: hovered ? 1 : 0 }}
          className="overflow-hidden"
        >
          <ul className="space-y-2 text-sm text-zinc-500 pb-3">
            {description.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {tags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono"
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

// ─────────────────────────────────────────────────────────────────────────────
// Project Card
// ─────────────────────────────────────────────────────────────────────────────
interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
  link?: string;
  status?: string;
}

const ProjectCard = ({ title, description, tags, icon: Icon, link, status }: ProjectCardProps) => (
  <motion.a
    href={link ?? '#'}
    target={link ? '_blank' : undefined}
    rel="noreferrer"
    whileHover={{ y: -5 }}
    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    data-cursor="hover"
    className="group relative flex flex-col p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm overflow-hidden hover:border-zinc-700/80 transition-colors"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

    <div className="relative z-10 flex-1">
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400/80 text-xs font-mono">
              {status}
            </span>
          )}
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-100 tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed mb-5">{description}</p>
    </div>

    <div className="relative z-10 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono"
        >
          {tag}
        </span>
      ))}
    </div>
  </motion.a>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) => (
  <ScrollReveal className="mb-12">
    <p className="text-xs font-semibold text-zinc-600 tracking-widest mb-3">{label}</p>
    <h2 className="text-3xl font-semibold text-zinc-100 tracking-tight">{title}</h2>
    {subtitle && <p className="text-zinc-500 mt-3 text-sm max-w-md">{subtitle}</p>}
    <div className="mt-5 h-px bg-zinc-800/60 w-full" />
  </ScrollReveal>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Application
// ─────────────────────────────────────────────────────────────────────────────
const activities: ActivityCardProps[] = [
  {
    title: 'PoliNetwork',
    role: 'Product & Operations Lead',
    icon: Network,
    description: [
      'Architecting the complete web ecosystem from ground up.',
      'Scaling technical operations for events gathering 1,000+ people.',
      'Leading cross-functional student engineering teams.',
      'Defining product vision and roadmap for open-source tooling.',
    ],
    tags: ['React', 'Node.js', 'Docker', 'Open Source'],
  },
  {
    title: 'Homelab Infrastructure',
    role: 'Sysadmin & Architecture',
    icon: Server,
    description: [
      'Self-hosting complex environments with high availability.',
      'Proxmox hypervisor + TrueNAS for storage and VMs.',
      'Automating deployments, backups, and monitoring workflows.',
      'Networking with VLANs, reverse proxies, and firewall rules.',
    ],
    tags: ['Proxmox', 'TrueNAS', 'Linux', 'Ansible'],
  },
  {
    title: 'Systems Programming',
    role: 'Low-Level Engineering',
    icon: Cpu,
    description: [
      'Writing performant C code for systems and embedded contexts.',
      'Memory management, data structures, and algorithm design.',
      'Operating systems fundamentals and process synchronization.',
    ],
    tags: ['C', 'POSIX', 'GDB', 'Make'],
  },
  {
    title: 'Digital Craftsmanship',
    role: 'Design & Frontend',
    icon: Layers,
    description: [
      'Bridging engineering and design for polished interfaces.',
      'Prototyping in Figma before writing a single line of code.',
      'Implementing fluid animations and micro-interactions.',
      'Obsessing over typography, spacing, and visual hierarchy.',
    ],
    tags: ['Figma', 'React', 'Framer Motion', 'CSS'],
  },
];

const projects: ProjectCardProps[] = [
  {
    title: 'PoliNetwork Web Platform',
    description:
      'A comprehensive open-source web ecosystem serving the student community at Politecnico di Milano — from event management to resource hubs.',
    tags: ['React', 'TypeScript', 'Docker', 'CI/CD'],
    icon: Globe,
    link: 'https://github.com/PoliNetwork',
    status: 'active',
  },
  {
    title: 'Personal Homelab',
    description:
      'A production-grade self-hosted infrastructure leveraging Proxmox virtualization and TrueNAS for bulletproof storage, running 20+ services.',
    tags: ['Proxmox', 'TrueNAS', 'Traefik', 'Grafana'],
    icon: HardDrive,
    status: 'always on',
  },
  {
    title: 'This Portfolio',
    description:
      'A performance-obsessed, design-forward personal site with physics-based interactions, kinetic typography, and custom cursor mechanics.',
    tags: ['React', 'Framer Motion', 'Vite', 'TypeScript'],
    icon: Code2,
    link: 'https://github.com/viganogabriele',
    status: 'v2',
  },
];

const skills = [
  { label: 'JavaScript', icon: Code2, color: '#F7DF1E', x: 40, y: 30 },
  { label: 'HTML', icon: Globe, color: '#E44D26', x: 260, y: 20 },
  { label: 'CSS', icon: Palette, color: '#264de4', x: 460, y: 50 },
  { label: 'C', icon: Terminal, color: '#a8b9cc', x: 150, y: 140 },
  { label: 'Git', icon: GitMerge, color: '#F05032', x: 380, y: 130 },
  { label: 'Linux', icon: Terminal, color: '#fcc624', x: 60, y: 230 },
  { label: 'Proxmox', icon: Server, color: '#E57000', x: 290, y: 220 },
  { label: 'TrueNAS', icon: HardDrive, color: '#0095D5', x: 500, y: 190 },
  { label: 'Figma', icon: FigmaIcon, color: '#A259FF', x: 180, y: 300 },
];

function App() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const scrambledText = useTextScramble();

  return (
    <div className="noise min-h-screen bg-[#080808] text-zinc-300 font-sans selection:bg-zinc-700/50 selection:text-white">
      <CustomCursor />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full bg-zinc-900/30 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-5%] w-[45%] h-[50%] rounded-full bg-zinc-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-zinc-800/10 blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 pb-40">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <motion.section
          className="min-h-[92vh] flex flex-col items-center justify-center text-center pt-8"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Magnetic strength={0.12}>
              <div className="relative mb-10 w-36 h-44 sm:w-44 sm:h-52 rounded-[2rem] overflow-hidden border border-zinc-700/40 shadow-2xl group">
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none" />
                <img
                  src={portrait}
                  alt="Gabriele Viganò"
                  className="w-full h-full object-cover object-top filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                />
              </div>
            </Magnetic>
          </motion.div>

          {/* Name + role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1 mb-6"
          >
            <p className="text-zinc-400 font-medium text-base tracking-wide">Gabriele Viganò</p>
            <p className="text-zinc-600 text-sm font-normal">Computer Engineering Student</p>
          </motion.div>

          {/* Scramble headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white leading-none mb-6 font-mono tabular-nums"
            aria-label="Building Systems"
          >
            {scrambledText}
            <span className="text-zinc-700 animate-pulse">_</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 1 }}
            className="max-w-sm mx-auto text-zinc-500 text-sm leading-relaxed mb-12"
          >
            From low-level systems to polished interfaces — I build things that work beautifully.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <Magnetic>
              <a
                href="https://github.com/viganogabriele"
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://linkedin.com/in/viganogabriele"
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="mailto:contact@viganogabriele.com"
                data-cursor="hover"
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition-colors shadow-lg shadow-white/5"
              >
                <Mail className="w-4 h-4" />
                Let's talk
              </a>
            </Magnetic>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-zinc-700 tracking-widest font-medium">scroll</span>
            <motion.div
              className="w-px h-10 bg-gradient-to-b from-zinc-700 to-transparent"
              animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.section>

        {/* ── What I Do ─────────────────────────────────────────────── */}
        <section className="mt-40">
          <SectionHeader
            label="01 / Expertise"
            title="What I Do."
            subtitle="Engineering across the stack — from infrastructure to interface."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {activities.map((act, i) => (
              <ScrollReveal key={act.title} delay={i * 0.08}>
                <ActivityCard {...act} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Projects ──────────────────────────────────────────────── */}
        <section className="mt-40">
          <SectionHeader
            label="02 / Projects"
            title="Selected Work."
            subtitle="A few things I've built or am actively working on."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {projects.map((proj, i) => (
              <ScrollReveal key={proj.title} delay={i * 0.1}>
                <ProjectCard {...proj} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Skills Playground ─────────────────────────────────────── */}
        <section className="mt-40">
          <SectionHeader
            label="03 / Stack"
            title="The Toolkit."
            subtitle="Drag them around — they won't break."
          />

          <ScrollReveal>
            <div className="relative w-full h-[380px] rounded-2xl border border-zinc-800/50 bg-zinc-950/40 overflow-hidden backdrop-blur-sm">
              {/* Dot grid background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 w-4 h-px bg-zinc-800 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 h-4 w-px bg-zinc-800 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              {skills.map((skill) => (
                <DraggableBubble
                  key={skill.label}
                  label={skill.label}
                  icon={skill.icon}
                  initialX={skill.x}
                  initialY={skill.y}
                  color={skill.color}
                />
              ))}

              <div className="absolute bottom-4 right-5 text-[10px] text-zinc-700 font-mono pointer-events-none">
                drag to rearrange
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <ScrollReveal delay={0.1}>
          <footer className="mt-40 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-700 font-mono">
              © {new Date().getFullYear()} Gabriele Viganò — Built with precision.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://github.com/viganogabriele"
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/viganogabriele"
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="mailto:contact@viganogabriele.com"
                data-cursor="hover"
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                Email
              </a>
            </div>
          </footer>
        </ScrollReveal>

      </main>
    </div>
  );
}

export default App;

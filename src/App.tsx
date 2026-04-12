import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import {
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
  Award,
  Users,
  Mic2,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Matter from 'matter-js';
import portrait from './photo-without-background.png';
import logo from './assets/logo-dark.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4" />
  </svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const FigmaIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
  </svg>
);

// ─── Custom Cursor ────────────────────────────────────────────────────────────
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const [hoverLevel, setHoverLevel] = useState<'none' | 'link' | 'bubble'>('none');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(mouseX, { stiffness: 100, damping: 16, mass: 0.9 });
  const ringY = useSpring(mouseY, { stiffness: 100, damping: 16, mass: 0.9 });

  const ringSize = hoverLevel === 'bubble' ? 64 : hoverLevel === 'link' ? 56 : 36;
  const ringOp = hoverLevel === 'bubble' ? 1 : hoverLevel === 'link' ? 0.8 : 0.45;

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', move);

    const enter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.dataset.cursorBubble !== undefined) setHoverLevel('bubble');
      else setHoverLevel('link');
    };
    const leave = () => setHoverLevel('none');

    const bind = () => {
      document.querySelectorAll<HTMLElement>('[data-cursor-bubble]').forEach(el => {
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
      });
      document.querySelectorAll<HTMLElement>('a, button, [data-cursor="hover"]').forEach(el => {
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
      });
    };
    bind();
    const obs = new MutationObserver(bind);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { window.removeEventListener('mousemove', move); obs.disconnect(); };
  }, [mouseX, mouseY]);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <motion.div
        className="cursor-ring"
        style={{ left: ringX, top: ringY }}
        animate={{ width: ringSize, height: ringSize, opacity: ringOp, borderColor: hoverLevel === 'none' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)', backdropFilter: hoverLevel !== 'none' ? 'blur(3px)' : 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </>
  );
};

// ─── Glassmorphism Navbar ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Expertise', href: '#expertise' },
  { label: 'Projects', href: '#projects' },
  { label: 'Stack', href: '#stack' },
  { label: 'Recognition', href: '#certifications' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const el = document.querySelector(target);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
    >
      <div className={cn(
        'flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-500',
        scrolled
          ? 'bg-zinc-950/70 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl'
          : 'bg-zinc-950/40 border-white/5 shadow-lg shadow-black/10 backdrop-blur-xl'
      )}>
        <a href="#" onClick={(e) => handleScrollTo(e, 'body')} data-cursor="hover" className="flex items-center gap-3 group">
           <img src={logo} alt="Gabriele Viganò" className="h-6 w-auto opacity-90 group-hover:opacity-100 transition-opacity filter invert drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </a>
        
        <div className="hidden sm:flex items-center gap-2">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              data-cursor="hover"
              className="px-4 py-2 rounded-full text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="mailto:contact@viganogabriele.com"
          data-cursor="hover"
          className="px-5 py-2 rounded-full text-[13px] font-bold text-black bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          Let's talk
        </a>
      </div>
    </motion.nav>
  );
};

// ─── Magnetic Wrapper ─────────────────────────────────────────────────────────
const Magnetic = ({ children, strength = 0.4 }: { children: React.ReactElement; strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.5 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

// ─── Floating Portrait ────────────────────────────────────────────────────────
const FloatingPortrait = () => {
  return (
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      className="relative z-10 w-64 md:w-80 flex justify-center cursor-default group"
    >
      {/* Soft dynamic glow behind silhouette */}
      <div className="absolute inset-x-0 top-[20%] bottom-0 bg-violet-600/20 blur-[80px] rounded-full scale-90 group-hover:bg-violet-500/30 transition-colors duration-700" />
      
      <div className="relative w-full h-[350px] md:h-[450px] overflow-visible flex items-end">
        <img
          src={portrait}
          alt="Gabriele Viganò"
          style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.6))' }}
          className="w-full h-full object-cover object-bottom z-10 transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </motion.div>
  );
};

// ─── Gradient Scramble Text ────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
const PHRASES = ['Building Systems', 'Designing Experiences'];

const TextScramble = () => {
  const [display, setDisplay] = useState(PHRASES[0]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scramble = useCallback((target: string) => {
    const frames = 18;
    let i = 0;
    const tick = () => {
      i++;
      const p = i / frames;
      setDisplay(
        target.split('').map((c, idx) => {
          if (c === ' ') return ' ';
          if (idx / target.length < p) return c;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
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
    scramble(PHRASES[0]);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scramble]);

  const handleHover = () => {
    setIsHovered(true);
    const nextIdx = (phraseIdx + 1) % PHRASES.length;
    setPhraseIdx(nextIdx);
    scramble(PHRASES[nextIdx]);
  };

  const handleLeave = () => {
    setIsHovered(false);
  };

  return (
    <h1
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight font-mono relative cursor-default"
    >
      <span
        className={cn(
          "bg-clip-text text-transparent bg-[length:200%_auto] transition-all duration-700 ease-out",
          isHovered
            ? "bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-[position:100%_center]"
            : "bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-[position:0%_center]"
        )}
      >
        {display}
      </span>
      <span className="text-zinc-600 animate-pulse ml-1">_</span>
    </h1>
  );
};

// ─── Scroll Reveal ─────────────────────────────────────────────────────────────
const ScrollReveal = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);


// ─── Matter.js Physics Logic ───────────────────────────────────────────────────
// We use a custom hook to manage bodies and sync them with React state
const useMatterPhysics = (containerRef: React.RefObject<HTMLDivElement | null>, items: any[]) => {
  const [positions, setPositions] = useState<{ x: number, y: number, angle: number }[]>(
    items.map(item => ({ x: item.x, y: item.y, angle: 0 }))
  );

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Engine & World Setup
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 } // no gravity, top-down view
    });
    const world = engine.world;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Bounds: Bouncy invisible walls
    const wallOpts = { isStatic: true, restitution: 0.8, friction: 0, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(width/2, -50, width*2, 100, wallOpts), // top
      Matter.Bodies.rectangle(width/2, height+50, width*2, 100, wallOpts), // bottom
      Matter.Bodies.rectangle(-50, height/2, 100, height*2, wallOpts), // left
      Matter.Bodies.rectangle(width+50, height/2, 100, height*2, wallOpts) // right
    ];
    Matter.World.add(world, walls);
    
    // Bodies
    const bodies = items.map(item => {
      const b = Matter.Bodies.rectangle(item.x, item.y, 140, 44, {
        chamfer: { radius: 22 },
        restitution: 0.95, // more bouncy
        friction: 0.005,
        frictionAir: 0.015,
        density: 0.05
      });
      Matter.Body.setInertia(b, Infinity); // Prevents spinning!
      return b;
    });
    Matter.World.add(world, bodies);
    
    // Mouse Interaction
    const mouse = Matter.Mouse.create(container);
    // Remove scroll capturing to avoid buggy page scrolling!
    mouse.element.removeEventListener("wheel", (mouse as any).mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(world, mouseConstraint);
    
    // Sync Loop
    let animationFrameId: number;
    const updateSync = () => {
      Matter.Engine.update(engine, 1000 / 60);
      setPositions(bodies.map(b => ({ x: b.position.x, y: b.position.y, angle: b.angle })));
      animationFrameId = requestAnimationFrame(updateSync);
    };
    updateSync();
    
    // Random initial push
    bodies.forEach(b => {
      Matter.Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1
      });
    });

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      Matter.Body.setPosition(walls[1], { x: w/2, y: h+50 });
      Matter.Body.setPosition(walls[3], { x: w+50, y: h/2 });
      Matter.Body.setPosition(walls[0], { x: w/2, y: -50 });
      Matter.Body.setVertices(walls[0], Matter.Bodies.rectangle(w/2, -50, w*2, 100).vertices);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      Matter.Engine.clear(engine);
    };
  }, [containerRef, items]);

  return positions;
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) => (
  <ScrollReveal className="mb-12">
    <p className="text-[10px] font-semibold text-zinc-600 tracking-[0.2em] mb-3 uppercase">{label}</p>
    <h2 className="text-4xl md:text-5xl font-semibold text-zinc-100 tracking-tight">{title}</h2>
    {subtitle && <p className="text-zinc-500 mt-4 text-base max-w-lg">{subtitle}</p>}
    <div className="mt-8 h-[1px] bg-gradient-to-r from-zinc-800 via-zinc-800/40 to-transparent w-full" />
  </ScrollReveal>
);

// ─── Activity Card ─────────────────────────────────────────────────────────────
interface ActivityCardProps {
  title: string; role: string; description: string[];
  icon: React.ElementType; tags?: string[]; highlight?: boolean;
}
const ActivityCard = ({ title, role, description, icon: Icon, tags, highlight }: ActivityCardProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      data-cursor="hover"
      className={cn(
        'relative p-7 rounded-3xl border overflow-hidden group shadow-lg',
        highlight
          ? 'border-violet-600/30 bg-gradient-to-br from-violet-950/40 via-[#080808] to-[#080808] shadow-violet-900/10'
          : 'border-white/5 bg-[#0a0a0a]'
      )}
    >
      {highlight && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-950 border border-violet-800 text-violet-300 text-[10px] font-bold tracking-widest uppercase">
          Leadership & Mgmt
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            'w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300',
            highlight
              ? 'bg-violet-950/80 border-violet-800/60 text-violet-400 group-hover:bg-violet-900 group-hover:text-white'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white'
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <motion.div animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8, y: hovered ? 0 : 8 }} transition={{ duration: 0.2 }}>
            <ArrowUpRight className={cn('w-5 h-5', highlight ? 'text-violet-400' : 'text-zinc-500')} />
          </motion.div>
        </div>
        <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-2">{title}</h3>
        <p className="text-sm font-medium text-zinc-400 mb-5">{role}</p>
        <motion.div initial={false} animate={{ height: hovered ? 'auto' : 0, opacity: hovered ? 1 : 0 }} className="overflow-hidden">
          <ul className="space-y-3 text-sm text-zinc-500 pb-4">
            {description.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={cn("mt-2 w-1.5 h-1.5 rounded-full shrink-0", highlight ? "bg-violet-500" : "bg-zinc-600")} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        {tags && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map(tag => (
              <span key={tag} className={cn(
                'px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors',
                highlight ? 'bg-violet-950/40 border-violet-800/30 text-violet-300 group-hover:border-violet-600/50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:border-zinc-600'
              )}>
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
  title: string; description: string; tags: string[];
  icon: React.ElementType; link?: string; status?: string;
}
const ProjectCard = ({ title, description, tags, icon: Icon, link, status }: ProjectCardProps) => (
  <motion.a
    href={link ?? '#'}
    target={link ? '_blank' : undefined}
    rel="noreferrer"
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    data-cursor="hover"
    className="group relative flex flex-col p-7 rounded-3xl border border-white/5 bg-[#0a0a0a] overflow-hidden hover:border-white/20 transition-all duration-300 shadow-lg"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="relative z-10 flex-1">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              {status}
            </span>
          )}
          <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight mb-3">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">{description}</p>
    </div>
    <div className="relative z-10 flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
          {tag}
        </span>
      ))}
    </div>
  </motion.a>
);

// ─── Certification Card ────────────────────────────────────────────────────────
interface CertProps { title: string; issuer: string; year: string; icon: React.ElementType; highlight?: boolean; }
const CertCard = ({ title, issuer, year, icon: Icon, highlight }: CertProps) => (
  <motion.div
    whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.03)' }}
    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    data-cursor="hover"
    className={cn(
      "group flex items-center gap-6 p-6 rounded-3xl border transition-colors cursor-default",
      highlight ? "border-violet-500/20 bg-violet-950/10" : "border-white/5 bg-[#0a0a0a]"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300",
      highlight ? "bg-violet-950/80 border-violet-800/60 text-violet-400 group-hover:bg-violet-900" : "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white"
    )}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-base font-bold text-zinc-100 truncate mb-1">{title}</p>
      <p className="text-sm text-zinc-400">{issuer}</p>
    </div>
    <span className="text-xs text-zinc-600 font-mono font-medium shrink-0 group-hover:text-zinc-400 transition-colors">{year}</span>
  </motion.div>
);

// ─── Data ──────────────────────────────────────────────────────────────────────
const activities: ActivityCardProps[] = [
  {
    title: 'PoliNetwork',
    role: 'Product & Operations Lead',
    icon: Network,
    highlight: true,
    description: [
      'Architecting a robust open-source web ecosystem serving thousands of students.',
      'Scaling technical operations for massive events gathering 1,000+ people.',
      'Leading cross-functional student engineering teams and managing active sprints.',
      'Defining product vision and executing long-term roadmaps.',
    ],
    tags: ['Leadership', 'System Architecture', 'Agile', 'Open Source'],
  },
  {
    title: 'Digital Craftsmanship',
    role: 'Design & Frontend Engineering',
    icon: Layers,
    description: [
      'Bridging the gap between engineering complexity and polished interfaces.',
      'Prototyping dynamic flows in Figma before writing a single line of code.',
      'Obsessing over kinetic typography, physics animations, and micro-interactions.',
    ],
    tags: ['React', 'Framer Motion', 'Figma', 'TypeScript'],
  },
  {
    title: 'Homelab Infrastructure',
    role: 'Sysadmin & Architecture',
    icon: Server,
    description: [
      'Self-hosting complex environments with high availability.',
      'Configuring Proxmox hypervisor, TrueNAS storage arrays, and containerized apps.',
      'Automating deployments, setting up reverse proxies, and maintaining zero-trust VLANs.',
    ],
    tags: ['Proxmox', 'Docker', 'Linux', 'Networking'],
  },
  {
    title: 'Systems Programming',
    role: 'Low-Level Engineering',
    icon: Cpu,
    description: [
      'Writing performant C code for systems and embedded contexts.',
      'Mastering memory management, custom data structures, and algorithm design.',
      'Deep dive into OS fundamentals: scheduling, process synchronization, IPC.',
    ],
    tags: ['C', 'POSIX', 'GDB', 'Make'],
  },
];

const projects: ProjectCardProps[] = [
  {
    title: 'PoliNetwork Ecosystem',
    description: 'An expansive open-source web platform serving the Politecnico di Milano student body. Built for high performance and scalability under load during massive university events.',
    tags: ['React', 'Node.js', 'Docker', 'PostgreSQL'],
    icon: Globe,
    link: 'https://github.com/PoliNetwork',
    status: 'PRODUCTION',
  },
  {
    title: 'Personal Infrastructure',
    description: 'A production-grade, self-hosted data center running in my home. Leveraging Proxmox VMs, TrueNAS storage, Traefik ingress, and comprehensive Grafana observability dashboards.',
    tags: ['Proxmox', 'TrueNAS', 'Traefik', 'Prometheus'],
    icon: HardDrive,
    status: 'SYSADMIN',
  },
  {
    title: 'Interactive Portfolio',
    description: 'A performance-obsessed, design-forward website featuring a full 2D physics sandbox using Matter.js, kinetic typography, and fluid Framer Motion animations.',
    tags: ['React', 'Matter.js', 'Vite', 'Tailwind'],
    icon: Code2,
    link: 'https://github.com/viganogabriele',
    status: 'V2 LIVE',
  },
];

const certifications: CertProps[] = [
  { title: 'Leadership & Project Management', issuer: 'PoliNetwork APS – Student Association', year: '2024', icon: Award, highlight: true },
  { title: 'Public Speaking & Communication', issuer: 'Politecnico di Milano', year: '2024', icon: Mic2 },
  { title: 'Team Coordination Dynamics', issuer: 'IEEE Student Branch', year: '2023', icon: Users },
];

const skills = [
  { label: 'JavaScript', icon: Code2, color: '#F7DF1E', x: 100, y: 100 },
  { label: 'HTML', icon: Globe, color: '#E44D26', x: 300, y: 150 },
  { label: 'CSS', icon: Palette, color: '#5C6BC0', x: 500, y: 120 },
  { label: 'C', icon: Terminal, color: '#a8b9cc', x: 200, y: 250 },
  { label: 'Git', icon: GitMerge, color: '#F05032', x: 450, y: 280 },
  { label: 'Linux', icon: Terminal, color: '#fcc624', x: 650, y: 180 },
  { label: 'Proxmox', icon: Server, color: '#E57000', x: 350, y: 80 },
  { label: 'TrueNAS', icon: HardDrive, color: '#0095D5', x: 600, y: 250 },
  { label: 'Figma', icon: FigmaIcon, color: '#A259FF', x: 700, y: 100 },
];

// ─── App ────────────────────────────────────────────────────────────────────────
function App() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  
  const playgroundRef = useRef<HTMLDivElement>(null);
  const physicsPositions = useMatterPhysics(playgroundRef, skills);

  return (
    <div className="noise min-h-screen bg-[#060606] text-zinc-300 selection:bg-violet-900/40 selection:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <CustomCursor />
      <Navbar />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-zinc-800/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-40">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <motion.section
          className="min-h-[100vh] flex flex-col md:flex-row items-center justify-between pt-32 pb-16 gap-12"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Left Content */}
          <div className="flex-1 flex flex-col items-start text-left z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-300 text-xs font-semibold tracking-wide uppercase">Computer Engineering Student</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-3xl sm:text-4xl text-white font-medium tracking-tight mb-2">Hey, I'm <span className="font-bold">Gabriele Viganò</span>.</h2>
              <TextScramble />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mt-12"
            >
              <Magnetic strength={0.2}>
                <a href="#expertise" data-cursor="hover" className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  Explore my work
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a href="https://github.com/viganogabriele" target="_blank" rel="noreferrer" data-cursor="hover" className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
                  <GithubIcon className="w-5 h-5" />
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a href="https://linkedin.com/in/viganogabriele" target="_blank" rel="noreferrer" data-cursor="hover" className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Right Portrait */}
          <motion.div
            className="flex-1 flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <FloatingPortrait />
          </motion.div>

        </motion.section>

        {/* ── What I Do ─────────────────────────────────────────────── */}
        <section id="expertise" className="mt-32 pt-20">
          <SectionHeader
            label="01 / Expertise"
            title="What I Do."
            subtitle="I build systems that perform reliably and interfaces that feel incredible."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act, i) => (
              <ScrollReveal key={act.title} delay={i * 0.1}>
                <ActivityCard {...act} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Projects ──────────────────────────────────────────────── */}
        <section id="projects" className="mt-40 pt-20">
          <SectionHeader
            label="02 / Selected Work"
            title="Featured Projects."
            subtitle="Real-world systems, open-source tech, and experimental playgrounds."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj, i) => (
              <ScrollReveal key={proj.title} delay={i * 0.1}>
                <ProjectCard {...proj} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Skills Playground (Physics Sandbox) ───────────────────── */}
        <section id="stack" className="mt-40 pt-20">
          <SectionHeader
            label="03 / The Toolkit"
            title="Physics Sandbox."
            subtitle="Powered by Matter.js. Grab them, throw them, watch them bounce."
          />
          <ScrollReveal>
            <div
              ref={playgroundRef}
              data-cursor-bubble="true"
              className="relative w-full h-[450px] rounded-[2rem] border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 2px, transparent 2px)',
                backgroundSize: '40px 40px',
              }}
            >
              {skills.map((skill, i) => {
                const pos = physicsPositions[i] || { x: -100, y: -100, angle: 0 };
                return (
                 <div
                    key={skill.label}
                    className="absolute top-0 left-0 flex items-center justify-center gap-2.5 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-medium text-[15px] select-none touch-none shadow-lg cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                    style={{
                      transform: `translate(${pos.x - 70}px, ${pos.y - 22}px) rotate(${pos.angle}rad)`, // Centers the pill
                      width: '140px', height: '44px'
                    }}
                  >
                    <skill.icon className="w-5 h-5 shrink-0" style={{ color: skill.color }} />
                    {skill.label}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </section>

        {/* ── Certifications ─────────────────────────────────────────── */}
        <section id="certifications" className="mt-40 pt-20">
          <SectionHeader
            label="04 / Recognition"
            title="Certifications."
            subtitle="Investing in leadership depth and effective communication."
          />
          <div className="flex flex-col gap-4">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert.title} delay={i * 0.1}>
                <CertCard {...cert} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <ScrollReveal delay={0.1}>
          <footer className="mt-40 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <img src={logo} alt="Logo" className="h-6 w-auto opacity-50 filter invert" />
              <p className="text-xs text-zinc-600 font-mono tracking-wide">
                © {new Date().getFullYear()} Gabriele Viganò — Crafted with precision.
              </p>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: 'GitHub', href: 'https://github.com/viganogabriele' },
                { label: 'LinkedIn', href: 'https://linkedin.com/in/viganogabriele' },
                { label: 'Email', href: 'mailto:contact@viganogabriele.com' },
              ].map(l => (
                <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer" data-cursor="hover"
                  className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </footer>
        </ScrollReveal>

      </main>
    </div>
  );
}

export default App;

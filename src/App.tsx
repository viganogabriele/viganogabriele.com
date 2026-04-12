import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink, Network, Server, Terminal, Palette, Code2, GitMerge } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// -------------------------------------------------------------
// Magnetic Effect Component
// -------------------------------------------------------------
const Magnetic = ({ children }: { children: React.ReactElement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

// -------------------------------------------------------------
// Shiny Text Component
// -------------------------------------------------------------
const ShinyText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <motion.span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-100 to-zinc-500 bg-[length:300%_auto]",
        className
      )}
      animate={{ backgroundPosition: ['300% center', '-300% center'] }}
      transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
    >
      {text}
    </motion.span>
  );
};

// -------------------------------------------------------------
// Expandable Project Card
// -------------------------------------------------------------
interface ProjectCardProps {
  title: string;
  role: string;
  description: string[];
  icon: React.ElementType;
}

const ProjectCard = ({ title, role, description, icon: Icon }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 overflow-hidden cursor-pointer backdrop-blur-sm group transition-colors hover:border-zinc-700/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Background glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <h3 className="text-xl font-semibold text-zinc-100 tracking-tight mb-1">{title}</h3>
        <p className="text-sm font-medium text-zinc-400 mb-4">{role}</p>
        
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
          className="overflow-hidden"
        >
          <ul className="space-y-2 text-sm text-zinc-500 pb-2">
            {description.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------------
// Floating Skill Item
// -------------------------------------------------------------
const SkillNode = ({ label, icon: Icon, delay = 0, initialPos }: { label: string, icon: React.ElementType, delay?: number, initialPos?: {x: number, y: number} }) => {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-md text-zinc-300 font-medium text-sm cursor-default absolute z-10"
      initial={initialPos}
      animate={{
        y: [initialPos?.y ?? 0, (initialPos?.y ?? 0) - 15, initialPos?.y ?? 0],
        x: [initialPos?.x ?? 0, (initialPos?.x ?? 0) + (Math.random() > 0.5 ? 5 : -5), initialPos?.x ?? 0],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
      whileHover={{ 
        scale: 1.1, 
        backgroundColor: "rgba(39, 39, 42, 0.8)",
        borderColor: "rgba(63, 63, 70, 0.8)",
        color: "#fff",
        zIndex: 50
      }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </motion.div>
  );
};

// -------------------------------------------------------------
// Main Application
// -------------------------------------------------------------
function App() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-900/10 blur-[120px]" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 py-20 pb-40">
        
        {/* --- Hero Section --- */}
        <motion.section 
          className="min-h-[85vh] flex flex-col items-center justify-center pt-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ y, opacity }}
        >
          {/* Portrait */}
          <Magnetic>
            <div className="relative group mb-10 w-40 h-50 sm:w-48 sm:h-60 rounded-[2rem] overflow-hidden border border-zinc-800/50 shadow-2xl transition-all duration-500 hover:border-zinc-600/50">
              <div className="absolute inset-0 bg-zinc-800/50 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 z-10" />
              <img 
                src="https://placehold.co/400x500/1a1a1a/555555?text=GV" 
                alt="Gabriele Viganò" 
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </Magnetic>

          <div className="text-center space-y-4">
            <motion.h2 
              className="font-medium text-zinc-500 tracking-widest text-sm uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Gabriele Viganò
            </motion.h2>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white">
              Engineering with <ShinyText text="vision." />
            </h1>
            <p className="max-w-md mx-auto text-zinc-400 text-sm sm:text-base leading-relaxed pt-4">
              Computer Engineering student from Milan crafting high-end digital systems and reliable tech infrastructure.
            </p>
          </div>

          <motion.div 
            className="flex items-center gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Magnetic>
              <a href="#" className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors text-zinc-400 flex items-center justify-center">
                <GithubIcon className="w-5 h-5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#" className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors text-zinc-400 flex items-center justify-center">
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="mailto:contact@viganogabriele.com" className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors">
                <Mail className="w-4 h-4" />
                Let's talk
              </a>
            </Magnetic>
          </motion.div>
        </motion.section>

        {/* --- What I Do Section --- */}
        <motion.section 
          className="mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-zinc-100 tracking-tight mb-8"
            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
          >
            What I Do.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <ProjectCard 
                title="PoliNetwork"
                role="Product & Operations Lead"
                description={[
                  "Architecting the complete Web Ecosystem.",
                  "Scaling technical operations for events gathering 1k+ people.",
                  "Leading cross-functional student engineering teams."
                ]}
                icon={Network}
              />
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <ProjectCard 
                title="Homelab Infrastructure"
                role="Sysadmin & Architecture"
                description={[
                  "Self-hosting complex environments ensuring high availability.",
                  "Utilizing Proxmox virtualization & TrueNAS storage.",
                  "Automating deployments and monitoring workflows."
                ]}
                icon={Server}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* --- Tech Stack Playground --- */}
        <motion.section 
          className="mt-40 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">The Toolkit.</h2>
            <p className="text-zinc-500 mt-2 text-sm">Play around with the stack.</p>
          </div>

          <div className="relative w-full max-w-2xl mx-auto h-[300px] border border-zinc-900 rounded-3xl overflow-hidden bg-zinc-950/50">
            {/* Center anchor point just for visual reference */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-zinc-800 -translate-x-1/2 -translate-y-1/2" />
            
            {/* Nodes scattered around */}
            <SkillNode label="JavaScript" icon={Code2} delay={0.2} initialPos={{ x: 100, y: 50 }} />
            <SkillNode label="TypeScript" icon={Terminal} delay={0.5} initialPos={{ x: 350, y: 80 }} />
            <SkillNode label="React" icon={Code2} delay={0.1} initialPos={{ x: 220, y: 150 }} />
            <SkillNode label="C" icon={Code2} delay={0.8} initialPos={{ x: 500, y: 200 }} />
            <SkillNode label="Linux" icon={Terminal} delay={0.3} initialPos={{ x: 80, y: 220 }} />
            <SkillNode label="Git" icon={GitMerge} delay={0.6} initialPos={{ x: 420, y: 120 }} />
            <SkillNode label="Design" icon={Palette} delay={0.4} initialPos={{ x: 280, y: 240 }} />
          </div>
        </motion.section>

      </main>
    </div>
  );
}

export default App;

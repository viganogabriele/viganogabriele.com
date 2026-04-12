import { type ClassValue, clsx } from "clsx";
import {
	AnimatePresence,
	motion,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import Lenis from "lenis";
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
import Matter from "matter-js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	BrowserRouter,
	Link,
	Navigate,
	Route,
	Routes,
	useLocation,
	useParams,
} from "react-router-dom";
import { twMerge } from "tailwind-merge";
import logo from "./assets/logo-dark.png";
import portrait from "./assets/photo-gabriele.webp";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const SITE_URL = "https://viganogabriele.com";

const slugify = (input: string) =>
	input
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");

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

// ─── Touch detection ──────────────────────────────────────────────────────────
const isTouchDevice = () =>
	typeof window !== "undefined" &&
	("ontouchstart" in window || navigator.maxTouchPoints > 0);

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
	{ label: "Expertise", href: "#expertise" },
	{ label: "Projects", href: "#projects" },
	{ label: "Stack", href: "#stack" },
	{ label: "Journey", href: "#journey" },
	{ label: "Notes", href: "#notes" },
	{ label: "Certifications", href: "#certifications" },
];

const Navbar = ({ onNavigate }: { onNavigate: (target: string) => void }) => {
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	useEffect(() => {
		const h = () => setScrolled(window.scrollY > 40);
		window.addEventListener("scroll", h, { passive: true });
		return () => window.removeEventListener("scroll", h);
	}, []);

	useEffect(() => {
		if (!mobileOpen) return;
		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMobileOpen(false);
		};
		window.addEventListener("keydown", onEscape);
		return () => window.removeEventListener("keydown", onEscape);
	}, [mobileOpen]);

	const handleScrollTo = (
		e: React.MouseEvent<HTMLAnchorElement>,
		target: string,
	) => {
		e.preventDefault();
		onNavigate(target);
		setMobileOpen(false);
	};

	return (
		<motion.nav
			initial={{ y: -80, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
			className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl"
		>
			<div
				className={cn(
					"flex items-center justify-between px-4 sm:px-5 py-3 rounded-full border transition-all duration-500",
					scrolled
						? "border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.05)]"
						: "border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
				)}
				style={{
					background: scrolled ? "rgba(8, 8, 8, 0.15)" : "rgba(8, 8, 8, 0.02)",
					backdropFilter: "blur(30px) saturate(200%)",
					WebkitBackdropFilter: "blur(30px) saturate(200%)",
				}}
			>
				<a
					href="#"
					onClick={(e) => handleScrollTo(e, "body")}
					data-cursor="hover"
					className="flex items-center gap-3 group"
				>
					<img
						src={logo}
						alt="Gabriele Viganò"
						className="h-5 w-auto opacity-80 group-hover:opacity-100 transition-opacity filter invert"
					/>
				</a>

				<div className="hidden lg:flex items-center gap-1">
					{NAV_LINKS.map((link) => (
						<a
							key={link.label}
							href={link.href}
							onClick={(e) => handleScrollTo(e, link.href)}
							data-cursor="hover"
							className="px-4 py-2 rounded-full text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.07] transition-all duration-300"
						>
							{link.label}
						</a>
					))}
				</div>

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
						onClick={() => setMobileOpen((prev) => !prev)}
						className="lg:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
						aria-label="Toggle navigation menu"
					>
						{mobileOpen ? (
							<X className="w-4 h-4" />
						) : (
							<Menu className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
						className="lg:hidden mt-2 rounded-2xl border border-white/10 bg-black/75 backdrop-blur-2xl p-3"
					>
						<nav className="grid grid-cols-2 gap-2">
							{NAV_LINKS.map((link) => (
								<a
									key={link.label}
									href={link.href}
									onClick={(e) => handleScrollTo(e, link.href)}
									className="px-3 py-2.5 rounded-xl text-[12px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
								>
									{link.label}
								</a>
							))}
							<Link
								to="/notes"
								onClick={() => setMobileOpen(false)}
								className="px-3 py-2.5 rounded-xl text-[12px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
							>
								All notes
							</Link>
							<Link
								to="/case-studies"
								onClick={() => setMobileOpen(false)}
								className="px-3 py-2.5 rounded-xl text-[12px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
							>
								Case studies
							</Link>
						</nav>
						<a
							href="mailto:info@viganogabriele.com"
							className="sm:hidden mt-3 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-[12px] font-semibold text-black bg-white hover:bg-zinc-200 transition-colors"
						>
							Let's talk
						</a>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
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
	return (
		<motion.div
			animate={{ y: [0, -15, 0] }}
			transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
			className="relative z-10 w-56 md:w-80 flex justify-center cursor-default group"
		>
			{/* Soft dynamic glow behind silhouette */}
			<div className="absolute inset-x-0 top-[20%] bottom-0 bg-violet-600/20 blur-[80px] rounded-full scale-90 group-hover:bg-violet-500/30 transition-colors duration-700" />

			<div className="relative w-full h-[320px] md:h-[450px] overflow-visible flex items-end">
				<img
					src={portrait}
					alt="Gabriele Viganò"
					loading="eager"
					decoding="async"
					fetchPriority="high"
					style={{ filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.6))" }}
					className="w-full h-full object-cover object-bottom z-10 transition-transform duration-700 group-hover:scale-105"
				/>
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
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
		};
	}, [scramble, text]);

	return (
		<h1
			onMouseEnter={() => {
				setIsHovered(true);
				scramble(text);
			}}
			onMouseLeave={() => setIsHovered(false)}
			className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight font-mono relative cursor-default"
		>
			<span
				className={cn(
					"bg-clip-text text-transparent bg-[length:200%_auto] transition-all duration-700 ease-out",
					isHovered
						? "bg-gradient-to-r from-blue-400 via-emerald-400 to-violet-400 bg-[position:100%_center]"
						: "bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-[position:0%_center]",
				)}
			>
				{display}
			</span>
			<span className="text-zinc-600 animate-pulse ml-1">_</span>
		</h1>
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
}) => (
	<motion.div
		className={className}
		initial={{ opacity: 0, y: 30 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true, margin: "-80px" }}
		transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
	>
		{children}
	</motion.div>
);

// ─── Matter.js Physics Hook ───────────────────────────────────────────────────
const useMatterPhysics = (
	containerRef: React.RefObject<HTMLDivElement | null>,
	items: { x: number; y: number }[],
) => {
	const [positions, setPositions] = useState<
		{ x: number; y: number; angle: number }[]
	>(items.map((_, i) => ({ x: i * 80 + 80, y: 100, angle: 0 })));

	useEffect(() => {
		if (!containerRef.current) return;

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
		const wallOpts = {
			isStatic: true,
			restitution: 0.8,
			friction: 0,
			render: { visible: false },
		};
		const walls = [
			Matter.Bodies.rectangle(
				width / 2,
				-wallThickness / 2,
				width * 2,
				wallThickness,
				wallOpts,
			),
			Matter.Bodies.rectangle(
				width / 2,
				height + wallThickness / 2,
				width * 2,
				wallThickness,
				wallOpts,
			),
			Matter.Bodies.rectangle(
				-wallThickness / 2,
				height / 2,
				wallThickness,
				height * 2,
				wallOpts,
			),
			Matter.Bodies.rectangle(
				width + wallThickness / 2,
				height / 2,
				wallThickness,
				height * 2,
				wallOpts,
			),
		];
		Matter.World.add(world, walls);

		const bodies = items.map(() => {
			const px = 70 + Math.random() * (width - 140);
			const py = 50 + Math.random() * (height - 100);
			const b = Matter.Bodies.rectangle(px, py, bodyWidth, bodyHeight, {
				chamfer: { radius: 22 },
				restitution: 0.95,
				friction: 0.005,
				frictionAir: 0.015,
				density: 0.05,
			});
			Matter.Body.setInertia(b, Infinity);
			return b;
		});
		Matter.World.add(world, bodies);

		const mouse = Matter.Mouse.create(container);
		const mouseWithWheel = mouse as Matter.Mouse & {
			mousewheel?: EventListener;
		};
		if (mouseWithWheel.mousewheel) {
			mouse.element.removeEventListener("wheel", mouseWithWheel.mousewheel);
			mouse.element.removeEventListener(
				"DOMMouseScroll",
				mouseWithWheel.mousewheel,
			);
		}

		const mouseConstraint = Matter.MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: false },
			},
		});
		Matter.World.add(world, mouseConstraint);

		const releaseDraggedBody = () => {
			mouseConstraint.mouse.button = -1;
			const releasedMouseConstraint = mouseConstraint as unknown as {
				body: Matter.Body | null;
				constraint: { bodyB: Matter.Body | null; pointB: Matter.Vector | null };
			};
			releasedMouseConstraint.body = null;
			releasedMouseConstraint.constraint.bodyB = null;
			releasedMouseConstraint.constraint.pointB = null;
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
			if (!isPointInsideContainer(point.clientX, point.clientY)) {
				releaseDraggedBody();
			}
		};

		let animationFrameId: number;
		const clampBodyToBounds = (body: Matter.Body) => {
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

		const updateSync = () => {
			Matter.Engine.update(engine, 1000 / 60);
			bodies.forEach(clampBodyToBounds);
			setPositions(
				bodies.map((b) => ({
					x: b.position.x,
					y: b.position.y,
					angle: b.angle,
				})),
			);
			animationFrameId = requestAnimationFrame(updateSync);
		};
		updateSync();

		bodies.forEach((b) => {
			Matter.Body.applyForce(b, b.position, {
				x: (Math.random() - 0.5) * 0.1,
				y: (Math.random() - 0.5) * 0.1,
			});
		});

		let prevScroll = window.scrollY;
		const handleScrollMotion = () => {
			const deltaY = window.scrollY - prevScroll;
			prevScroll = window.scrollY;
			const forceMag = Math.min(Math.abs(deltaY) * 0.0006, 0.2); // Increased force
			if (forceMag > 0.005) {
				bodies.forEach((b) => {
					// Add some randomness but generally push in the direction of scroll
					Matter.Body.applyForce(b, b.position, {
						x: (Math.random() - 0.5) * forceMag * 3,
						y:
							(Math.random() - 0.5) * forceMag * 2 +
							(deltaY > 0 ? -forceMag : forceMag),
					});
				});
			}
		};
		window.addEventListener("scroll", handleScrollMotion, { passive: true });

		const handleResize = () => {
			const { width: w, height: h } = getSize();
			width = w;
			height = h;
			Matter.Body.setPosition(walls[0], { x: w / 2, y: -wallThickness / 2 });
			Matter.Body.setPosition(walls[1], { x: w / 2, y: h + wallThickness / 2 });
			Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: h / 2 });
			Matter.Body.setPosition(walls[3], { x: w + wallThickness / 2, y: h / 2 });
			bodies.forEach(clampBodyToBounds);
		};

		// Release drag when pointer exits/interruption happens to prevent cards escaping the sandbox.
		container.addEventListener("mouseleave", releaseDraggedBody);
		window.addEventListener("mouseup", releaseDraggedBody);
		window.addEventListener("touchend", releaseDraggedBody, { passive: true });
		window.addEventListener("touchcancel", releaseDraggedBody, {
			passive: true,
		});
		window.addEventListener("touchmove", handleTouchMove, { passive: true });
		window.addEventListener("blur", releaseDraggedBody);
		window.addEventListener("resize", handleResize);

		return () => {
			container.removeEventListener("mouseleave", releaseDraggedBody);
			window.removeEventListener("mouseup", releaseDraggedBody);
			window.removeEventListener("touchend", releaseDraggedBody);
			window.removeEventListener("touchcancel", releaseDraggedBody);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("blur", releaseDraggedBody);
			window.removeEventListener("scroll", handleScrollMotion);
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(animationFrameId);
			Matter.Engine.clear(engine);
			Matter.World.clear(world, false);
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

	return (
		<ScrollReveal className="mb-12">
			<p className="text-[10px] font-semibold text-zinc-600 tracking-[0.2em] mb-3 uppercase">
				{label}
			</p>
			<div
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className="relative inline-block cursor-default"
			>
				<motion.h2
					animate={{
						filter: isHovered ? "blur(0px)" : "blur(0px)",
						opacity: isHovered ? 1 : 1,
						x: isHovered ? 10 : 0,
					}}
					className="text-4xl md:text-5xl font-semibold text-zinc-100 tracking-tight transition-all duration-500"
				>
					{title}
				</motion.h2>
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: isHovered ? "100%" : "0%" }}
					className="absolute -bottom-2 left-0 h-[2px] bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
				/>
			</div>
			{subtitle && (
				<motion.p
					animate={{
						filter: isHovered ? "blur(1px)" : "blur(0px)",
						opacity: isHovered ? 0.4 : 1,
					}}
					className="text-zinc-500 mt-4 text-base max-w-lg transition-all duration-500"
				>
					{subtitle}
				</motion.p>
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
			whileHover={!isTouch ? { y: -4, scale: 1.005 } : {}}
			transition={{ type: "spring", stiffness: 260, damping: 28 }}
			data-cursor="hover"
			className={cn(
				"relative p-7 rounded-3xl border overflow-hidden group shadow-lg cursor-pointer select-none",
				highlight
					? "border-violet-600/30 bg-gradient-to-br from-violet-950/40 via-[#080808] to-[#080808] shadow-violet-900/10"
					: "border-white/5 bg-[#0a0a0a]",
			)}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
			{highlight && (
				<div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
			)}

			<div className="relative z-10">
				<div className="flex items-start justify-between mb-6">
					<div
						className={cn(
							"w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300",
							highlight
								? "bg-violet-950/80 border-violet-800/60 text-violet-400 group-hover:bg-violet-900 group-hover:text-white"
								: "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white",
						)}
					>
						<Icon className="w-6 h-6" />
					</div>
					{/* Expand / arrow indicator */}
					<motion.div
						animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 1 : 0.45 }}
						transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
						className={cn(
							"mt-1",
							highlight ? "text-violet-400" : "text-zinc-500",
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
					transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
					className="overflow-hidden"
				>
					<ul className="space-y-3 text-sm text-zinc-500 pb-2">
						{description.map((item, i) => (
							<li key={i} className="flex items-start gap-3">
								<span
									className={cn(
										"mt-2 w-1.5 h-1.5 rounded-full shrink-0",
										highlight ? "bg-violet-500" : "bg-zinc-600",
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
									highlight
										? "bg-violet-950/40 border-violet-800/30 text-violet-300 group-hover:border-violet-600/50"
										: "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:border-zinc-600",
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
	caseStudy?: {
		challenge: string;
		approach: string;
		impact: string;
	};
	onOpenCaseStudy?: (project: {
		title: string;
		status?: string;
		caseStudy: { challenge: string; approach: string; impact: string };
	}) => void;
}
const ProjectCard = ({
	title,
	description,
	tags,
	icon: Icon,
	link,
	status,
	caseStudy,
	onOpenCaseStudy,
}: ProjectCardProps) => (
	<motion.a
		href={link}
		onClick={(event) => {
			if (!link) event.preventDefault();
		}}
		target={link ? "_blank" : undefined}
		rel="noreferrer"
		whileHover={link ? { y: -6, scale: 1.02 } : { y: -2, scale: 1.005 }}
		transition={{ type: "spring", stiffness: 350, damping: 25 }}
		data-cursor="hover"
		className={cn(
			"group relative flex flex-col p-7 rounded-3xl border border-white/5 bg-[#0a0a0a] overflow-hidden transition-all duration-500 shadow-lg h-full",
			link ? "hover:border-white/20" : "cursor-default",
		)}
	>
		<motion.div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
					{link && (
						<ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
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
					className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono"
				>
					{tag}
				</span>
			))}
		</div>
		{caseStudy && onOpenCaseStudy && (
			<button
				type="button"
				onClick={(event) => {
					event.preventDefault();
					onOpenCaseStudy({
						title,
						status,
						caseStudy,
					});
				}}
				className="relative z-10 mt-5 w-fit text-xs font-semibold tracking-wide uppercase text-zinc-400 hover:text-white transition-colors"
			>
				View case study
			</button>
		)}
	</motion.a>
);

const CaseStudyModal = ({
	selected,
	onClose,
}: {
	selected: {
		title: string;
		status?: string;
		caseStudy: { challenge: string; approach: string; impact: string };
	} | null;
	onClose: () => void;
}) => (
	<AnimatePresence>
		{selected && (
			<>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm"
				/>
				<motion.div
					initial={{ opacity: 0, y: 24, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 18, scale: 0.98 }}
					transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
					className="fixed z-[71] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,44rem)] rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8 shadow-2xl"
				>
					<div className="flex items-start justify-between gap-4 mb-6">
						<div>
							<p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
								Case Study
							</p>
							<h3 className="text-2xl font-semibold text-zinc-100 tracking-tight">
								{selected.title}
							</h3>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="text-zinc-500 hover:text-white text-sm transition-colors"
						>
							Close
						</button>
					</div>

					<div className="space-y-5">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
								Challenge
							</p>
							<p className="text-sm text-zinc-300 leading-relaxed">
								{selected.caseStudy.challenge}
							</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
								Approach
							</p>
							<p className="text-sm text-zinc-300 leading-relaxed">
								{selected.caseStudy.approach}
							</p>
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
								Impact
							</p>
							<p className="text-sm text-zinc-300 leading-relaxed">
								{selected.caseStudy.impact}
							</p>
						</div>
					</div>

					<div className="mt-7 flex items-center justify-between">
						<Link
							to={`/case-studies/${slugify(selected.title)}`}
							className="text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
						>
							Open full page
						</Link>
					</div>
				</motion.div>
			</>
		)}
	</AnimatePresence>
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
							<div className="relative pl-14 pr-2">
								<div
									className={cn(
										"absolute left-[7px] top-7 w-6 h-6 rounded-full border flex items-center justify-center backdrop-blur-lg",
										item.highlight
											? "border-violet-400/70 bg-violet-500/20 text-violet-300"
											: "border-zinc-600 bg-zinc-900 text-zinc-300",
									)}
								>
									<TimelineIcon className="w-3.5 h-3.5" />
								</div>
								<div
									className={cn(
										"rounded-3xl border p-5 md:p-6",
										item.highlight
											? "border-violet-500/25 bg-violet-950/20"
											: "border-white/5 bg-[#0b0b0b]",
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
const CertCard = ({
	title,
	issuer,
	year,
	link,
	icon: Icon,
	highlight,
}: CertProps) => (
	<motion.a
		href={link}
		target="_blank"
		rel="noreferrer"
		whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.03)" }}
		transition={{ type: "spring", stiffness: 350, damping: 25 }}
		data-cursor="hover"
		className={cn(
			"group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl border transition-colors",
			highlight
				? "border-violet-500/20 bg-violet-950/10"
				: "border-white/5 bg-[#0a0a0a]",
		)}
	>
		<div
			className={cn(
				"w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300",
				highlight
					? "bg-violet-950/80 border-violet-800/60 text-violet-400 group-hover:bg-violet-900"
					: "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white",
			)}
		>
			<Icon className="w-5 h-5" />
		</div>
		<div className="flex-1 min-w-0 w-full">
			<p className="text-base font-bold text-zinc-100 mb-1 leading-snug">
				{title}
			</p>
			<p className="text-sm text-zinc-400">{issuer}</p>
			<div className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500 group-hover:text-white transition-colors">
				View credential
				<ArrowUpRight className="w-3.5 h-3.5" />
			</div>
		</div>
		<span className="text-xs text-zinc-600 font-mono font-medium shrink-0 self-start sm:self-center group-hover:text-zinc-400 transition-colors">
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
		caseStudy: {
			challenge:
				"Ensure platform reliability during peak academic traffic with tight contributor bandwidth.",
			approach:
				"Introduced modular frontend architecture, deployment hardening and prioritized observability dashboards for fast incident response.",
			impact:
				"Reduced critical downtime windows and improved release confidence during high-traffic event periods.",
		},
	},
	{
		title: "Personal Infrastructure",
		description:
			"A production-grade, self-hosted data center running in my home. Leveraging Proxmox VMs, TrueNAS storage, Traefik ingress, and comprehensive Grafana observability dashboards.",
		tags: ["Proxmox", "TrueNAS", "Traefik", "Prometheus"],
		icon: HardDrive,
		status: "SYSADMIN",
		caseStudy: {
			challenge:
				"Build a home infrastructure resilient to service spikes and hardware maintenance without breaking key workflows.",
			approach:
				"Combined Proxmox virtualization, storage segmentation and ingress routing with centralized metrics and alerting.",
			impact:
				"Higher service continuity, clearer bottleneck visibility and faster recovery from infra incidents.",
		},
	},
	{
		title: "Interactive Portfolio",
		description:
			"A performance-obsessed, design-forward website featuring a full 2D physics sandbox using Matter.js, kinetic typography, and fluid Framer Motion animations.",
		tags: ["React", "Matter.js", "Vite", "Tailwind"],
		icon: Code2,
		link: "https://github.com/viganogabriele",
		status: "V2 LIVE",
		caseStudy: {
			challenge:
				"Craft a portfolio that feels cinematic while preserving performance and interaction quality across devices.",
			approach:
				"Used Framer Motion orchestration, physics sandbox tuning and layered visual textures with responsive fallbacks.",
			impact:
				"Significantly improved perceived quality and interaction depth without compromising build stability.",
		},
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
	sourceLink?: string;
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
		sourceLink: "https://github.com/viganogabriele",
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
		sourceLink: "https://github.com/PoliNetwork",
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
		sourceLink: "https://github.com/viganogabriele",
	},
];

const noteBySlug = new Map(notes.map((note) => [note.slug, note]));
const projectBySlug = new Map(
	projects.map((project) => [slugify(project.title), project]),
);

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

const Preloader = ({ progress }: { progress: number }) => (
	<motion.div
		initial={{ opacity: 1 }}
		exit={{ opacity: 0, filter: "blur(18px)" }}
		transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
		className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center"
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

// ─── App ────────────────────────────────────────────────────────────────────────
function HomePage() {
	const prefersReducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll();
	const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "25%"]);
	const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

	const [isPreloading, setIsPreloading] = useState(true);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [selectedCaseStudy, setSelectedCaseStudy] = useState<{
		title: string;
		status?: string;
		caseStudy: { challenge: string; approach: string; impact: string };
	} | null>(null);
	const lenisRef = useRef<Lenis | null>(null);

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
		if (prefersReducedMotion) return;

		const lenis = new Lenis({
			duration: 1.1,
			lerp: 0.09,
			wheelMultiplier: 0.95,
			touchMultiplier: 1,
			smoothWheel: true,
			syncTouch: false,
		});

		lenisRef.current = lenis;
		let raf = 0;

		const run = (time: number) => {
			lenis.raf(time);
			raf = requestAnimationFrame(run);
		};

		raf = requestAnimationFrame(run);

		return () => {
			cancelAnimationFrame(raf);
			lenis.destroy();
			lenisRef.current = null;
		};
	}, [prefersReducedMotion]);

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
			<AnimatePresence>
				{isPreloading ? <Preloader progress={loadingProgress} /> : null}
			</AnimatePresence>

			<div
				className="noise min-h-screen bg-[#060606] text-zinc-300 selection:bg-violet-900/40 selection:text-white"
				style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
			>
				<CustomCursor />
				<Navbar onNavigate={scrollToSection} />

				{/* Ambient glows */}
				<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
					<div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[150px] md:opacity-50" />
					<div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/25 blur-[160px] md:opacity-60" />
					<div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/20 blur-[140px] md:opacity-40" />
				</div>

				<main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
					{/* ── Hero ─────────────────────────────────────────────────── */}
					<motion.section
						className="min-h-[100vh] flex flex-col md:flex-row items-center justify-between pt-38 sm:pt-40 md:pt-28 pb-16 gap-10 md:gap-12"
						style={{ y: heroY, opacity: heroOpacity }}
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
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: 0.3,
									duration: 0.9,
									ease: [0.16, 1, 0.3, 1],
								}}
							>
								<h2 className="text-2xl sm:text-3xl text-zinc-400 font-medium tracking-tight mb-2">
									Hey, I'm{" "}
									<span className="text-white font-bold">Gabriele Viganò</span>.
								</h2>
								<TextScramble text="I build cool things." />
							</motion.div>

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
									<ProjectCard
										{...proj}
										onOpenCaseStudy={setSelectedCaseStudy}
									/>
								</ScrollReveal>
							))}
						</div>
					</section>

					{/* ── Skills Playground (Physics Sandbox) ───────────────────── */}
					<section id="stack" className="mt-40 pt-20">
						<SectionHeader
							label="03 / The Toolkit"
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
											className="absolute top-0 left-0 flex items-center justify-center gap-2.5 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-medium text-[14px] select-none touch-none shadow-lg cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
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
					</section>

					{/* ── Interactive Timeline ───────────────────────────────────── */}
					<section id="journey" className="mt-40 pt-20">
						<SectionHeader
							label="04 / Journey"
							title="Interactive Timeline."
							subtitle="Key moments that shaped my product, systems, and design engineering path."
						/>
						<InteractiveTimeline items={timelineItems} />
					</section>

					{/* ── Notes ─────────────────────────────────────────────────── */}
					<section id="notes" className="mt-40 pt-20">
						<SectionHeader
							label="05 / Notes"
							title="Engineering Notes."
							subtitle="Short technical writes on motion systems, architecture decisions, and infrastructure operations."
						/>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{notes.map((note, i) => (
								<ScrollReveal key={note.title} delay={i * 0.08}>
									<motion.div
										data-cursor="hover"
										whileHover={{ y: -4, scale: 1.01 }}
										transition={{ type: "spring", stiffness: 320, damping: 24 }}
										className="group h-full flex flex-col rounded-3xl border border-white/5 bg-[#0a0a0a] p-6 hover:border-white/20 transition-colors"
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
														className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono"
													>
														{tag}
													</span>
												))}
											</div>
										</Link>
									</motion.div>
								</ScrollReveal>
							))}
						</div>
					</section>

					{/* ── Certifications ─────────────────────────────────────────── */}
					<section id="certifications" className="mt-40 pt-20">
						<SectionHeader
							label="06 / Recognition"
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
					<Footer onNavigate={scrollToSection} />
				</main>
				<CaseStudyModal
					selected={selectedCaseStudy}
					onClose={() => setSelectedCaseStudy(null)}
				/>
			</div>
		</>
	);
}

const DetailTopBar = () => (
	<header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/40">
		<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
			<Link
				to="/"
				className="flex items-center gap-3 text-zinc-300 hover:text-white"
			>
				<img
					src={logo}
					alt="Gabriele Vigano"
					className="h-5 w-auto opacity-80 filter invert"
				/>
			</Link>
			<nav className="flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-zinc-500">
				<Link to="/#projects" className="hover:text-white transition-colors">
					Projects
				</Link>
				<Link to="/notes" className="hover:text-white transition-colors">
					Notes
				</Link>
				<Link to="/case-studies" className="hover:text-white transition-colors">
					Case Studies
				</Link>
			</nav>
		</div>
	</header>
);

const ContentShell = ({ children }: { children: React.ReactNode }) => (
	<div
		className="noise min-h-screen bg-[#060606] text-zinc-300 selection:bg-violet-900/40 selection:text-white"
		style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
	>
		<CustomCursor />
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
			<div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[150px] md:opacity-50" />
			<div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/25 blur-[160px] md:opacity-60" />
		</div>
		<div className="relative z-10">{children}</div>
	</div>
);

const NotesIndexPage = () => (
	<ContentShell>
		<PageMeta
			title="Engineering Notes | Gabriele Vigano"
			description="Technical notes on motion systems, architecture decisions and infrastructure operations."
			path="/notes"
		/>
		<DetailTopBar />
		<main className="max-w-5xl mx-auto px-6 py-14">
			<SectionHeader
				label="Notes"
				title="Engineering Notes."
				subtitle="A growing collection of practical write-ups from product, frontend motion, and infrastructure work."
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
				{notes.map((note, index) => (
					<ScrollReveal key={note.slug} delay={index * 0.06}>
						<Link
							to={`/notes/${note.slug}`}
							className="block rounded-3xl border border-white/8 bg-[#0a0a0a] p-6 hover:border-white/20 transition-colors"
						>
							<p className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500 mb-3">
								{note.date} • {note.readingTime}
							</p>
							<h3 className="text-xl text-zinc-100 font-semibold tracking-tight mb-3">
								{note.title}
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed">
								{note.preview}
							</p>
						</Link>
					</ScrollReveal>
				))}
			</div>
		</main>
	</ContentShell>
);

const NoteDetailPage = () => {
	const { slug = "" } = useParams();
	const note = noteBySlug.get(slug);

	if (!note) return <Navigate to="/notes" replace />;

	return (
		<ContentShell>
			<PageMeta
				title={`${note.title} | Gabriele Vigano`}
				description={note.preview}
				path={`/notes/${note.slug}`}
			/>
			<DetailTopBar />
			<main className="max-w-3xl mx-auto px-6 py-14">
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
				{note.sourceLink && (
					<a
						href={note.sourceLink}
						target="_blank"
						rel="noreferrer"
						className="inline-flex mt-10 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
					>
						Reference Link
					</a>
				)}
			</main>
		</ContentShell>
	);
};

const CaseStudiesIndexPage = () => (
	<ContentShell>
		<PageMeta
			title="Case Studies | Gabriele Vigano"
			description="Deeper context on selected projects: challenges, approach and outcomes."
			path="/case-studies"
		/>
		<DetailTopBar />
		<main className="max-w-5xl mx-auto px-6 py-14">
			<SectionHeader
				label="Case Studies"
				title="Selected Project Breakdowns."
				subtitle="Longer-form context around technical constraints, decisions and impact."
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
				{projects
					.filter((project) => project.caseStudy)
					.map((project, index) => (
						<ScrollReveal key={project.title} delay={index * 0.08}>
							<Link
								to={`/case-studies/${slugify(project.title)}`}
								className="block rounded-3xl border border-white/8 bg-[#0a0a0a] p-6 hover:border-white/20 transition-colors"
							>
								<h3 className="text-xl text-zinc-100 font-semibold tracking-tight mb-3">
									{project.title}
								</h3>
								<p className="text-sm text-zinc-400 leading-relaxed">
									{project.description}
								</p>
							</Link>
						</ScrollReveal>
					))}
			</div>
		</main>
	</ContentShell>
);

const CaseStudyDetailPage = () => {
	const { slug = "" } = useParams();
	const project = projectBySlug.get(slug);

	if (!project?.caseStudy) return <Navigate to="/case-studies" replace />;

	return (
		<ContentShell>
			<PageMeta
				title={`${project.title} Case Study | Gabriele Vigano`}
				description={project.description}
				path={`/case-studies/${slug}`}
			/>
			<DetailTopBar />
			<main className="max-w-3xl mx-auto px-6 py-14">
				<p className="text-[11px] font-mono uppercase tracking-[0.16em] text-zinc-500 mb-3">
					Case Study
				</p>
				<h1 className="text-4xl md:text-5xl text-zinc-100 font-semibold tracking-tight mb-8">
					{project.title}
				</h1>
				<div className="space-y-8">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
							Challenge
						</p>
						<p className="text-zinc-300 leading-relaxed">
							{project.caseStudy.challenge}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
							Approach
						</p>
						<p className="text-zinc-300 leading-relaxed">
							{project.caseStudy.approach}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
							Impact
						</p>
						<p className="text-zinc-300 leading-relaxed">
							{project.caseStudy.impact}
						</p>
					</div>
				</div>
			</main>
		</ContentShell>
	);
};

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
			<Route path="/notes" element={<NotesIndexPage />} />
			<Route path="/notes/:slug" element={<NoteDetailPage />} />
			<Route path="/case-studies" element={<CaseStudiesIndexPage />} />
			<Route path="/case-studies/:slug" element={<CaseStudyDetailPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
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

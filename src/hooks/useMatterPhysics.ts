import { useEffect, useState } from "react";
import type { RefObject } from "react";

interface PhysicsItem {
  x: number;
  y: number;
}

interface Position {
  x: number;
  y: number;
  angle: number;
}

/** A dynamic import keeps Matter.js out of the mobile and reduced-motion paths. */
export function useMatterPhysics(
  containerRef: RefObject<HTMLDivElement | null>,
  items: PhysicsItem[],
  disabled: boolean,
) {
  const [positions, setPositions] = useState<Position[]>(() =>
    items.map((item) => ({ x: item.x, y: item.y, angle: 0 })),
  );

  useEffect(() => {
    if (disabled || !containerRef.current) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const init = async () => {
      const Matter = (await import("matter-js")).default;
      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;
      const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.0004 } });
      const bodyWidth = 140;
      const bodyHeight = 44;
      const wallThickness = 240;
      // top/bottom insets keep pills clear of the "Bench" and "MATTER.JS" labels
      const topInset = 48;
      const bottomInset = 48;
      let width = container.clientWidth;
      let height = container.clientHeight;

      const walls = [
        Matter.Bodies.rectangle(width / 2, topInset - wallThickness / 2, width * 2, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(width / 2, height - bottomInset + wallThickness / 2, width * 2, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true }),
        Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true }),
      ];
      const bodies = items.map((item, i) => {
        // spread pills across the container width on entry so they don't cluster
        const spread = Math.max(bodyWidth / 2, width - bodyWidth / 2);
        const spawnX = bodyWidth / 2 + ((spread - bodyWidth / 2) * (i + 0.5)) / items.length;
        const spawnY = Math.min(Math.max(28, item.y * 0.6), Math.max(28, height / 2));
        const body = Matter.Bodies.rectangle(spawnX, spawnY, bodyWidth, bodyHeight, {
          chamfer: { radius: 22 },
          restitution: 0.55,
          friction: 0.015,
          frictionAir: 0.03,
          density: 0.05,
        });
        Matter.Body.setInertia(body, Infinity);
        // gentle random impulse — no cluster explosion
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.12,
          y: (Math.random() - 0.9) * 0.14,
        });
        return body;
      });
      Matter.World.add(engine.world, [...walls, ...bodies]);

      const mouse = Matter.Mouse.create(container);
      const wheelMouse = mouse as { mousewheel?: EventListener };
      if (wheelMouse.mousewheel) {
        mouse.element.removeEventListener("wheel", wheelMouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", wheelMouse.mousewheel);
      }
      const constraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      Matter.World.add(engine.world, constraint);

      const release = () => {
        constraint.mouse.button = -1;
        const mutable = constraint as unknown as { body: unknown; constraint: { bodyB: unknown; pointB: unknown } };
        mutable.body = null;
        mutable.constraint.bodyB = null;
        mutable.constraint.pointB = null;
      };

      const clamp = (body: (typeof bodies)[number]) => {
        const minY = topInset + bodyHeight / 2;
        const maxY = Math.max(minY, height - bottomInset - bodyHeight / 2);
        const nextX = Math.min(Math.max(bodyWidth / 2, body.position.x), Math.max(bodyWidth / 2, width - bodyWidth / 2));
        const nextY = Math.min(Math.max(minY, body.position.y), maxY);
        if (nextX !== body.position.x || nextY !== body.position.y) Matter.Body.setPosition(body, { x: nextX, y: nextY });
      };

      let frame = 0;
      let visible = true;
      const loop = () => {
        if (!visible || document.hidden) return;
        Matter.Engine.update(engine, 1000 / 60);
        bodies.forEach(clamp);
        setPositions(bodies.map((body) => ({ x: body.position.x, y: body.position.y, angle: body.angle })));
        frame = requestAnimationFrame(loop);
      };
      const start = () => {
        if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
      };
      const stop = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) start(); else stop();
      }, { threshold: 0.1 });
      const onVisibility = () => document.hidden ? stop() : start();
      const onResize = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        Matter.Body.setPosition(walls[0], { x: width / 2, y: topInset - wallThickness / 2 });
        Matter.Body.setPosition(walls[1], { x: width / 2, y: height - bottomInset + wallThickness / 2 });
        Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: height / 2 });
        Matter.Body.setPosition(walls[3], { x: width + wallThickness / 2, y: height / 2 });
        bodies.forEach(clamp);
      };

      observer.observe(container);
      window.addEventListener("mouseup", release);
      window.addEventListener("blur", release);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      start();
      dispose = () => {
        stop();
        observer.disconnect();
        window.removeEventListener("mouseup", release);
        window.removeEventListener("blur", release);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        Matter.Engine.clear(engine);
        Matter.World.clear(engine.world, false);
      };
    };

    void init();
    return () => { cancelled = true; dispose?.(); };
  }, [containerRef, disabled, items]);

  return positions;
}

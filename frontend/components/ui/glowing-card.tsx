"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React, { useCallback } from "react";

export const GlowingCard = ({
  children,
  className,
  containerClassName,
  gradientColor = "var(--color-amber)",
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientColor?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const background1 = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${gradientColor}20, transparent 80%)`;
  const background2 = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${gradientColor}40, transparent 80%)`;

  const handleMouseMove = useCallback(
    ({ clientX, clientY, currentTarget }: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-xl border border-border/50 bg-background p-px",
        containerClassName
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: background1 }}
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl"
        style={{ background: background2, opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
      <div
        className={cn(
          "relative rounded-xl bg-background/80 backdrop-blur-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const CardSpotlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.05), transparent 80%)`;

  const handleMouseMove = useCallback(
    ({ clientX, clientY, currentTarget }: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
        style={{ background }}
      />
      {children}
    </div>
  );
};

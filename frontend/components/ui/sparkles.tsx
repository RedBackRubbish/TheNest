"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { useState, useEffect } from "react";

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const SparklesCore = ({
  id = "sparkles",
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.2,
  speed = 1,
  particleColor = "#FFF",
  particleDensity = 100,
}: SparklesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: particleDensity }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: (2 + Math.random() * 4) / speed,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [particleDensity, minSize, maxSize, speed]);

  if (particles.length === 0) {
    return <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ background }} />;
  }

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background }}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            boxShadow: `0 0 ${particle.size * 2}px ${particleColor}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteors, setMeteors] = React.useState<Array<{
    id: number;
    top: number;
    left: number;
    delay: number;
    duration: number;
  }>>([]);

  React.useEffect(() => {
    const newMeteors = Array.from({ length: number }).map((_, i) => ({
      id: i,
      top: Math.random() * 50,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 0.6 + Math.random() * 0.8,
    }));
    setMeteors(newMeteors);
  }, [number]);

  if (meteors.length === 0) {
    return <div className={cn("absolute inset-0 overflow-hidden", className)} />;
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {meteors.map((meteor) => (
        <motion.span
          key={meteor.id}
          className="absolute h-0.5 w-0.5 rotate-[215deg] rounded-full bg-gradient-to-r from-amber to-transparent shadow-[0_0_0_1px_#ffffff10]"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [0, -200],
            y: [0, 200],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: meteor.duration,
            repeat: Infinity,
            delay: meteor.delay,
            ease: "linear",
          }}
        >
          <div className="absolute top-1/2 -left-[2px] h-px w-[40px] -translate-y-1/2 bg-gradient-to-r from-amber via-amber/50 to-transparent" />
        </motion.span>
      ))}
    </div>
  );
};

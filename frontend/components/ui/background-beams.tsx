"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { useState, useEffect } from "react";

interface PathData {
  path: string;
  duration: number;
}

export const BackgroundBeams = React.memo(
  ({ className }: { className?: string }) => {
    const [paths, setPaths] = useState<PathData[]>([]);

    useEffect(() => {
      const generatePaths = () => {
        const newPaths: PathData[] = [];
        for (let i = 0; i < 12; i++) {
          const startX = Math.random() * 100;
          const endX = Math.random() * 100;
          const controlX1 = Math.random() * 100;
          const controlY1 = 20 + Math.random() * 30;
          const controlX2 = Math.random() * 100;
          const controlY2 = 50 + Math.random() * 30;
          newPaths.push({
            path: `M${startX} 0 C${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} 100`,
            duration: 4 + Math.random() * 4,
          });
        }
        setPaths(newPaths);
      };
      generatePaths();
    }, []);

    if (paths.length === 0) {
      return <div className={cn("absolute inset-0 overflow-hidden", className)} />;
    }

    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black,transparent)]",
          className
        )}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="beamGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-onyx)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--color-onyx)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-onyx)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beamGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-ignis)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--color-ignis)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-ignis)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beamGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-hydra)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--color-hydra)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-hydra)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {paths.map((pathData, index) => (
            <motion.path
              key={index}
              d={pathData.path}
              stroke={`url(#beamGradient${(index % 3) + 1})`}
              strokeWidth="0.15"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.5, 0.5, 0],
              }}
              transition={{
                duration: pathData.duration,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      </div>
    );
  }
);

BackgroundBeams.displayName = "BackgroundBeams";

"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

export const Spotlight = ({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute z-[1] h-[200%] w-[200%]",
        className
      )}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="spotlight-gradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={fill || "var(--color-onyx)"} stopOpacity="0.3" />
            <stop offset="50%" stopColor={fill || "var(--color-onyx)"} stopOpacity="0.1" />
            <stop offset="100%" stopColor={fill || "var(--color-onyx)"} stopOpacity="0" />
          </radialGradient>
          <filter id="spotlight-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
          </filter>
        </defs>
        <ellipse
          cx="512"
          cy="512"
          rx="400"
          ry="250"
          fill="url(#spotlight-gradient)"
          filter="url(#spotlight-blur)"
        />
      </svg>
    </motion.div>
  );
};

"use client";

import { motion } from "motion/react";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main className={className} {...props}>
      <div className="relative flex flex-col h-full items-center justify-center bg-background text-foreground transition-bg">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="
              [--aurora:repeating-linear-gradient(100deg,var(--color-onyx)_10%,var(--color-ignis)_15%,var(--color-hydra)_20%,var(--color-amber)_25%,var(--color-onyx)_30%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--color-background)_0%,var(--color-background)_7%,transparent_10%,transparent_12%,var(--color-background)_16%)]
              [background-image:var(--dark-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[10px] invert-0
              after:content-[''] after:absolute after:inset-0 
              after:[background-image:var(--dark-gradient),var(--aurora)]
              after:[background-size:200%,_100%] 
              after:animate-aurora after:[background-attachment:fixed] 
              after:mix-blend-difference
              pointer-events-none
              absolute -inset-[10px] opacity-40
            "
          />
        </div>
        {showRadialGradient && (
          <div 
            className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
          />
        )}
        {children}
      </div>
    </main>
  );
};

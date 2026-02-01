"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { useRef, useState } from "react";

export const MovingBorder = ({
  children,
  duration = 4000,
  rx = "8px",
  ry = "8px",
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}) => {
  return (
    <Component
      className={cn(
        "relative p-[1px] overflow-hidden bg-transparent",
        containerClassName
      )}
      style={{ borderRadius: rx }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${rx} * 0.96)` }}
      >
        <MovingBorderSVG rx={rx} ry={ry} duration={duration} />
      </div>
      <div
        className={cn(
          "relative bg-background backdrop-blur-xl z-10",
          className
        )}
        style={{ borderRadius: `calc(${rx} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
};

const MovingBorderSVG = ({
  rx = "8px",
  ry = "8px",
  duration = 4000,
}: {
  rx?: string;
  ry?: string;
  duration?: number;
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  const [pathLength, setPathLength] = useState(0);

  React.useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="moving-border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-onyx)" />
          <stop offset="33%" stopColor="var(--color-ignis)" />
          <stop offset="66%" stopColor="var(--color-hydra)" />
          <stop offset="100%" stopColor="var(--color-amber)" />
        </linearGradient>
      </defs>
      <rect
        ref={pathRef}
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={rx}
        ry={ry}
        fill="none"
        stroke="url(#moving-border-gradient)"
        strokeWidth="2"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength}
        className="animate-moving-border"
        style={
          {
            "--path-length": pathLength,
            "--duration": `${duration}ms`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
};

export const GlowingBorder = ({
  children,
  className,
  containerClassName,
  gradientColors = ["var(--color-onyx)", "var(--color-ignis)", "var(--color-hydra)"],
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientColors?: string[];
}) => {
  return (
    <div
      className={cn(
        "relative p-[1px] rounded-xl overflow-hidden",
        containerClassName
      )}
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div
        className={cn(
          "relative bg-background rounded-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

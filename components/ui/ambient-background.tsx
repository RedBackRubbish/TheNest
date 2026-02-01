"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AmbientBackgroundProps {
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function AmbientBackground({ className, intensity = "medium" }: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    let animationId: number
    let particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }> = []
    
    const colors = [
      "rgba(212, 175, 55, 0.15)",  // Gold
      "rgba(56, 189, 248, 0.1)",   // Cyan
      "rgba(139, 92, 246, 0.08)",  // Purple
    ]
    
    const particleCount = intensity === "low" ? 30 : intensity === "medium" ? 50 : 80
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    
    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
        
        // Draw connections to nearby particles
        particles.forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.03 * (1 - distance / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    resize()
    window.addEventListener("resize", resize)
    animate()
    
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [intensity])
  
  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none",
        className
      )}
      style={{ zIndex: 0 }}
    />
  )
}

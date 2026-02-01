"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/nest/sidebar";
import { SenateGraph } from "@/components/nest/senate-graph";
import { CodeViewer } from "@/components/nest/code-viewer";
import { GovernanceLog } from "@/components/nest/governance-log";
import { MissionInput } from "@/components/nest/mission-input";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore, Meteors } from "@/components/ui/sparkles";
import { CardSpotlight } from "@/components/ui/glowing-card";
import { FlipWords } from "@/components/ui/text-effects";
import { Search, Activity, Shield, Zap, Scale, BookOpen } from "lucide-react";

export default function NestDashboard() {
  const [activeView, setActiveView] = useState("missions");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMissionSubmit = useCallback(async (mission: string) => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);
  }, []);

  return (
    <div className="relative flex h-screen bg-background overflow-hidden">
      {/* Global Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <BackgroundBeams className="opacity-30" />
        <Meteors number={15} />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />
      </div>

      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-16 border-b border-border/50 px-6 flex items-center justify-between bg-background/50 backdrop-blur-xl z-10"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-green-500"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.7)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-mono text-muted-foreground">
                KERNEL: <span className="text-green-500 font-semibold">ONLINE</span>
              </span>
            </motion.div>

            <div className="h-4 w-px bg-border" />

            <span className="text-xs font-mono text-muted-foreground">
              Governance Mode:{" "}
              <span className="text-amber">
                <FlipWords
                  words={["SOVEREIGN", "CONSTITUTIONAL", "DEMOCRATIC"]}
                  duration={4000}
                  className="font-semibold"
                />
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
              Session: {new Date().toISOString().split("T")[0]}
            </span>
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeView === "missions" && (
              <motion.div
                key="missions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6 space-y-6"
              >
                {/* Mission Input Hero */}
                <div className="relative py-12">
                  <SparklesCore
                    className="absolute inset-0"
                    particleColor="var(--color-amber)"
                    particleDensity={30}
                    minSize={0.3}
                    maxSize={0.8}
                    speed={0.5}
                  />
                  <MissionInput onSubmit={handleMissionSubmit} isProcessing={isProcessing} />
                </div>

                {/* Dashboard Grid */}
                <div className="max-w-7xl mx-auto space-y-6">
                  <SenateGraph />
                  <CodeViewer />
                </div>
              </motion.div>
            )}

            {activeView === "chronicle" && (
              <motion.div
                key="chronicle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <motion.h2
                      className="text-3xl font-bold bg-gradient-to-r from-onyx via-foreground to-onyx bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      The Chronicle
                    </motion.h2>
                    <p className="text-muted-foreground mt-2">
                      Historical record of all Senate decisions
                    </p>
                  </div>

                  <CardSpotlight className="p-6">
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search precedents and case law..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50 transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      {["CASE-2026-001", "CASE-2026-002", "CASE-2026-003"].map((id, i) => (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-amber/30 hover:bg-secondary/50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-amber">{id}</span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                              APPROVED
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Precedent established for secure API endpoint generation...
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardSpotlight>
                </div>
              </motion.div>
            )}

            {activeView === "constitution" && (
              <motion.div
                key="constitution"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <motion.div
                      className="inline-flex items-center gap-2 mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Scale className="w-8 h-8 text-amber" />
                    </motion.div>
                    <motion.h2
                      className="text-3xl font-bold bg-gradient-to-r from-amber via-foreground to-amber bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      The Constitution
                    </motion.h2>
                    <p className="text-muted-foreground mt-2">
                      Fundamental laws governing the Synthetic Civilization
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      {
                        title: "Article 1: Primary Directive",
                        icon: Shield,
                        color: "#22c55e",
                        content: "All generated code must pass security validation before deployment. No exceptions.",
                      },
                      {
                        title: "Article 50: Martial Governance",
                        icon: Zap,
                        color: "#ef4444",
                        content: "Emergency bypass protocol for time-critical operations. All bypassed code tagged as UNGOVERNED and requires post-hoc review.",
                      },
                      {
                        title: "Article 7: Stare Decisis",
                        icon: BookOpen,
                        color: "#a855f7",
                        content: "Prior rulings establish binding precedent. The Chronicle serves as the source of truth for constitutional interpretation.",
                      },
                    ].map((article, i) => (
                      <motion.div
                        key={article.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                      >
                        <CardSpotlight className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className="p-3 rounded-xl"
                              style={{ backgroundColor: `${article.color}15` }}
                            >
                              <article.icon
                                className="w-6 h-6"
                                style={{ color: article.color }}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                              <p className="text-muted-foreground">{article.content}</p>
                            </div>
                          </div>
                        </CardSpotlight>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <motion.h2
                      className="text-3xl font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Settings
                    </motion.h2>
                    <p className="text-muted-foreground mt-2">
                      Configure your Governance Deck
                    </p>
                  </div>

                  <CardSpotlight className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Backend API Endpoint</label>
                      <input
                        type="text"
                        placeholder="https://your-backend.railway.app"
                        defaultValue={process.env.NEXT_PUBLIC_API_URL || ""}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50 transition-all font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        The URL of your FastAPI backend running on Railway
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div>
                          <p className="font-medium">Live Telemetry</p>
                          <p className="text-sm text-muted-foreground">
                            Stream real-time agent activity
                          </p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-amber transition-colors" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-foreground rounded-full transition-transform peer-checked:translate-x-5" />
                        </div>
                      </label>
                    </div>
                  </CardSpotlight>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Governance Log (Always visible at bottom) */}
        <div className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl">
          <GovernanceLog />
        </div>
      </main>
    </div>
  );
}

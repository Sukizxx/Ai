"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BreathingCoreProps {
  size?: number;
  active?: boolean; // true while generating/thinking
  fragmented?: boolean; // true during discussion mode
  nodeCount?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function BreathingCore({
  size = 120,
  active = false,
  fragmented = false,
  nodeCount = 4,
}: BreathingCoreProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {!fragmented ? (
          <motion.div
            key="core"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative"
            style={{ width: size, height: size }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ffffff 0%, #8a8a92 40%, #1c1c1f 75%)",
              }}
              animate={
                active
                  ? { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }
                  : { scale: [1, 1.04, 1], opacity: [0.55, 0.7, 0.55] }
              }
              transition={{
                duration: active ? 1.6 : 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-white/10"
              animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
              transition={{
                duration: active ? 1.6 : 3.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="fragmented"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
            style={{ width: size, height: size }}
          >
            <svg width={size} height={size} className="absolute inset-0">
              {Array.from({ length: nodeCount }).map((_, i) =>
                Array.from({ length: nodeCount }).map((_, j) => {
                  if (j <= i) return null;
                  const angle1 = (i / nodeCount) * Math.PI * 2;
                  const angle2 = (j / nodeCount) * Math.PI * 2;
                  const r = size * 0.32;
                  const cx = size / 2;
                  const cy = size / 2;
                  const x1 = cx + r * Math.cos(angle1);
                  const y1 = cy + r * Math.sin(angle1);
                  const x2 = cx + r * Math.cos(angle2);
                  const y2 = cy + r * Math.sin(angle2);
                  return (
                    <motion.line
                      key={`${i}-${j}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#5c5c63"
                      strokeWidth={1}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: [0.15, 0.4, 0.15] }}
                      transition={{
                        pathLength: { duration: 0.6, delay: 0.1 * (i + j) },
                        opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />
                  );
                })
              )}
            </svg>
            {Array.from({ length: nodeCount }).map((_, i) => {
              const angle = (i / nodeCount) * Math.PI * 2;
              const r = size * 0.32;
              const cx = size / 2;
              const cy = size / 2;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: size * 0.14,
                    height: size * 0.14,
                    left: x - (size * 0.14) / 2,
                    top: y - (size * 0.14) / 2,
                    background:
                      "radial-gradient(circle at 35% 30%, #ffffff 0%, #8a8a92 60%, #2e2e33 100%)",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    scale: { duration: 0.4, delay: i * 0.08, ease: EASE },
                    opacity: {
                      duration: 1.8,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeInOut",
                    },
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeoSkeuomorphicToggleProps {
  isActive: boolean;
  onChange: (state: boolean) => void;
}

export default function NeoSkeuomorphicToggle({
  isActive,
  onChange,
}: NeoSkeuomorphicToggleProps) {
  const [showBurst, setShowBurst] = useState(false);
  const prevActive = useRef(isActive);

  // Organic animation delay offsets
  const ringDelays = useRef([
    Math.random() * -4,
    Math.random() * -4,
    Math.random() * -4
  ]);

  // Fire pulse burst only on STANDBY → ACTIVE transition
  useEffect(() => {
    if (isActive && !prevActive.current) {
      setShowBurst(true);
      const timer = setTimeout(() => setShowBurst(false), 700);
      return () => clearTimeout(timer);
    }
    prevActive.current = isActive;
  }, [isActive]);

  const cyanBright = 'rgba(0, 245, 255, 0.9)';
  const cyanMid = 'rgba(0, 245, 255, 0.5)';
  const cyanDim = 'rgba(0, 245, 255, 0.15)';
  const cyanGlow = 'rgba(0, 245, 255, 0.4)';

  return (
    <motion.div
      animate={{
        scale: isActive ? [1, 1.04, 1] : [0.98, 1.02, 0.98],
        opacity: isActive ? 1 : [0.75, 0.9, 0.75],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.button
        onClick={() => onChange(!isActive)}
        className="relative w-36 h-36 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* ── Concentric Ring 1 (Outermost, slow) ── */}
        <motion.div
          animate={{
            borderColor: isActive ? cyanMid : cyanDim,
            opacity: isActive ? 0.6 : 0.12,
          }}
          transition={{ duration: 0.6 }}
          className="absolute -inset-4 rounded-full pointer-events-none"
          style={{
            border: '1.5px dashed',
            borderColor: cyanDim,
            animation: `reactor-ring-spin ${isActive ? '18s' : '36s'} linear infinite`,
            animationDelay: `${ringDelays.current[0]}s`,
            willChange: 'transform, opacity',
          }}
        />

        {/* ── Concentric Ring 2 (Mid, counter-rotate) ── */}
        <motion.div
          animate={{
            borderColor: isActive ? cyanMid : cyanDim,
            opacity: isActive ? 0.4 : 0.08,
          }}
          transition={{ duration: 0.6 }}
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{
            border: '1px dotted',
            borderColor: cyanDim,
            animation: `reactor-ring-spin-reverse ${isActive ? '12s' : '24s'} linear infinite`,
            animationDelay: `${ringDelays.current[1]}s`,
            willChange: 'transform, opacity',
          }}
        />

        {/* ── Concentric Ring 3 (Inner, fast) ── */}
        <motion.div
          animate={{
            borderColor: isActive ? cyanBright : cyanDim,
            opacity: isActive ? 0.75 : 0.12,
          }}
          transition={{ duration: 0.6 }}
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            border: '1px solid',
            borderColor: cyanDim,
            animation: `reactor-ring-spin ${isActive ? '8s' : '16s'} linear infinite`,
            animationDelay: `${ringDelays.current[2]}s`,
            willChange: 'transform, opacity',
          }}
        />

        {/* ── Outer Glass Shell ── */}
        <motion.div
          animate={{
            boxShadow: isActive
              ? `0 0 40px ${cyanGlow}, 0 0 80px rgba(0, 245, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.7), inset -2px -2px 8px rgba(0, 0, 0, 0.5), inset 2px 2px 8px rgba(0, 245, 255, 0.25)`
              : `0 0 10px rgba(0, 245, 255, 0.08), 0 20px 50px rgba(0, 0, 0, 0.8), inset -2px -2px 8px rgba(0, 0, 0, 0.7), inset 2px 2px 4px rgba(0, 245, 255, 0.05)`,
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-black/20 backdrop-blur-xl border-2"
          style={{
            borderColor: isActive ? cyanMid : cyanDim,
          }}
        />

        {/* ── Metal Ring Inner Layer ── */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/5 to-black/40 border border-white/5" />

        {/* ── Central Crystal Core (radial gradient for depth) ── */}
        <motion.div
          animate={{
            scale: isActive ? 1.12 : 1,
            boxShadow: isActive
              ? `0 0 40px ${cyanBright}, inset 0 0 25px rgba(0, 245, 255, 0.45)`
              : `0 0 4px rgba(0, 245, 255, 0.05), inset 0 0 4px rgba(0, 245, 255, 0.03)`,
          }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-6 rounded-full backdrop-blur-sm border-2"
          style={{
            borderColor: isActive ? cyanMid : cyanDim,
            background: isActive
              ? 'radial-gradient(circle at 40% 35%, rgba(0, 245, 255, 0.5), rgba(0, 245, 255, 0.15) 60%, rgba(5, 8, 10, 0.8))'
              : 'radial-gradient(circle at 40% 35%, rgba(0, 245, 255, 0.05), rgba(0, 245, 255, 0.01) 60%, rgba(5, 8, 10, 0.95))',
          }}
        >
          {/* Specular highlight for 3D glass effect */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.15), transparent 40%)'
            }}
          />
        </motion.div>

        {/* ── Inner Glow Pulse (both states — brighter when active) ── */}
        <motion.div
          animate={{
            opacity: isActive ? [0.65, 0.45, 0.65] : [0.2, 0.12, 0.2],
            scale: isActive ? [0.8, 1.1, 0.8] : [0.9, 1.02, 0.9],
          }}
          transition={{ duration: isActive ? 3 : 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 245, 255, 0.25), transparent 70%)',
            willChange: 'transform, opacity',
          }}
        />
        {isActive && (
          <motion.div
            animate={{
              opacity: [0.45, 0.3, 0.45],
              scale: [0.7, 1.15, 0.7],
            }}
            transition={{ duration: 3.7, repeat: Infinity, delay: 0.6, ease: 'easeInOut' }}
            className="absolute inset-10 rounded-full bg-[rgba(0,245,255,0.15)]"
            style={{ willChange: 'transform, opacity' }}
          />
        )}

        {/* ── Power Icon ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            width={48}
            height={48}
            viewBox="0 0 64 64"
            animate={{
              fill: isActive ? '#00F5FF' : 'rgba(0, 245, 255, 0.4)',
              filter: isActive
                ? 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.6))'
                : 'drop-shadow(0 0 2px rgba(0, 245, 255, 0.15))',
            }}
            transition={{ duration: 0.5 }}
          >
            <path
              d="M32 4C17.6 4 6 15.6 6 30c0 14.4 11.6 26 26 26s26-11.6 26-26c0-14.4-11.6-26-26-26zm0 48c-12.2 0-22-9.8-22-22s9.8-22 22-22 22 9.8 22 22-9.8 22-22 22zm0-38c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V16c0-1.1-.9-2-2-2z"
              fillRule="evenodd"
            />
          </motion.svg>
        </div>

        {/* ── Outer Glow Ring (always visible, brighter when active) ── */}
        <motion.div
          animate={{
            opacity: isActive ? [0.65, 0.45, 0.65] : [0.08, 0.03, 0.08],
            scale: isActive ? [1, 1.15, 1] : [1, 1.01, 1],
          }}
          transition={{
            duration: isActive ? 3 : 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-3 rounded-full pointer-events-none"
          style={{
            border: `1.5px solid rgba(0, 245, 255, ${isActive ? 0.35 : 0.03})`,
            willChange: 'transform, opacity',
          }}
        />

        {/* ── Pulse Burst (fires once on activation) ── */}
        <AnimatePresence>
          {showBurst && (
            <motion.div
              key="pulse-burst"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute -inset-2 rounded-full pointer-events-none"
              style={{
                border: `2px solid rgba(0, 245, 255, 0.6)`,
                boxShadow: `0 0 30px rgba(0, 245, 255, 0.5)`,
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

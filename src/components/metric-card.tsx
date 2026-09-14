'use client';

import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  accent: 'cyan' | 'gold';
  icon: string;
  description: string;
  isHighlight?: boolean;
}

export default function MetricCard({
  title,
  value,
  unit,
  accent,
  icon,
  description,
  isHighlight = false,
}: MetricCardProps) {
  const accentColor = accent === 'cyan' ? '#00F5FF' : '#D4AF37';
  const accentClass = accent === 'cyan' ? 'text-accent' : 'text-primary';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
        isHighlight ? 'glass-card-elevated' : 'glass-card'
      }`}
    >
      {/* Gradient Background Animation */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(
            90deg,
            rgba(${accent === 'cyan' ? '0, 245, 255' : '212, 175, 55'}, 0.1),
            transparent
          )`,
          backgroundSize: '200% 100%',
        }}
      />

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              {title}
            </h3>
            <span className="text-xl">{icon}</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Main Value */}
        <div className="space-y-2">
          <motion.div
            key={value}
            animate={{ opacity: [0.5, 1], y: [5, 0] }}
            transition={{ duration: 0.4 }}
            className="flex items-baseline gap-2"
          >
            <span className={`text-4xl md:text-5xl font-bold terminal-text ${accentClass}`}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground font-mono">{unit}</span>
          </motion.div>

          {/* Animated Underline */}
          <motion.div
            animate={{
              width: ['0%', '100%', '100%'],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="h-0.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </motion.div>
  );
}

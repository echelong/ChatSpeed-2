'use client';

import { motion, type Variants } from 'framer-motion';
import MetricCard from './metric-card';

interface MetricsGridProps {
  ramSaved: number;
  nodesPruned: number;
  latency: number;
//   isScanning: boolean;
}

export default function MetricsGrid({
  ramSaved,
  nodesPruned,
  latency,
//   isScanning,
}: MetricsGridProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8"
    >
      {/* RAM Saved - Large Card */}
      <motion.div variants={itemVariants} className="lg:col-span-1">
        <MetricCard
          title="RAM Saved"
          value={ramSaved.toFixed(1)}
          unit="MB"
          accent="cyan"
          icon="🧠"
          description="Total memory reclaimed"
          isHighlight
        />
      </motion.div>

      {/* Nodes Pruned - Large Card */}
      <motion.div variants={itemVariants} className="lg:col-span-1">
        <MetricCard
          title="Nodes Pruned"
          value={nodesPruned.toString()}
          unit="nodes"
          accent="gold"
          icon="✂️"
          description="JSON nodes removed"
          isHighlight
        />
      </motion.div>

      {/* Latency Reduction - Large Card */}
      <motion.div variants={itemVariants} className="lg:col-span-1">
        <MetricCard
          title="Latency Reduction"
          value={latency.toFixed(1)}
          unit="ms"
          accent="cyan"
          icon="⚡"
          description="Response time saved"
          isHighlight
        />
      </motion.div>

      {/* Data Stream Status */}
      <motion.div variants={itemVariants}>
        <motion.div className="glass-card-elevated p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-lg">📡</div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Stream Status
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Active data interception mode
            </p>
          </div>
          <motion.div
            animate={{
              boxShadow: ['0 0 10px rgba(0, 245, 255, 0.3)', '0 0 20px rgba(0, 245, 255, 0.6)'],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/50 text-accent text-xs font-mono"
          >
            CONNECTED
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pruning Algorithm */}
      <motion.div variants={itemVariants}>
        <motion.div className="glass-card-elevated p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-lg">🔬</div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Algorithm
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Surgical graft complexity
            </p>
          </div>
          <motion.div className="flex items-baseline gap-1 terminal-text">
            <span className="text-primary font-bold">O</span>
            <span className="text-accent">(1)</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Efficiency Score */}
      <motion.div variants={itemVariants}>
        <motion.div className="glass-card-elevated p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-lg">📊</div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Efficiency
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Current optimization rate
            </p>
          </div>
          <motion.div
            animate={{
              width: Math.min((ramSaved / 100) * 100, 100) + '%',
            }}
            transition={{ duration: 0.5 }}
            className="w-full h-1 bg-secondary rounded-full overflow-hidden"
          >
            <motion.div
              animate={{
                background: [
                  'linear-gradient(90deg, #D4AF37, #00F5FF)',
                  'linear-gradient(90deg, #00F5FF, #D4AF37)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full w-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';

interface LoadingMetricValueProps {
  label?: 'ram' | 'nodes';
  showLabel?: boolean;
}

export const LoadingMetricValue = ({
  label = 'ram',
  showLabel = false
}: LoadingMetricValueProps) => {
  // Different animation styles for each metric type
  const animationVariants = {
    ram: {
      opacity: [0.4, 1, 0.4],
      textShadow: [
        '0 0 4px rgba(0, 245, 255, 0.2)',
        '0 0 12px rgba(0, 245, 255, 0.6)',
        '0 0 4px rgba(0, 245, 255, 0.2)',
      ],
    },
    nodes: {
      opacity: [0.4, 1, 0.4],
      textShadow: [
        '0 0 4px rgba(212, 175, 55, 0.2)',
        '0 0 12px rgba(212, 175, 55, 0.5)',
        '0 0 4px rgba(212, 175, 55, 0.2)',
      ],
    },
  };

  const colorMap = {
    ram: '#00F5FF',
    nodes: '#D4AF37',
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {showLabel && (
        <span className="text-xs text-muted-foreground/40 font-medium">
          {label === 'ram' ? 'Scanning...' : 'Processing...'}
        </span>
      )}
      <motion.div
        animate={animationVariants[label]}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="metric-value font-mono tracking-tight"
        style={{
          color: colorMap[label],
          letterSpacing: '-0.02em',
          fontSize: '1.875rem',
          fontWeight: 700,
        }}
      >
        <span>●</span>
        <motion.span
          animate={{ opacity: [0.3, 0.6, 1, 0.6, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
        >
          ●
        </motion.span>
        <motion.span
          animate={{ opacity: [0.3, 0.3, 0.6, 1, 0.6] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        >
          ●
        </motion.span>
      </motion.div>
    </div>
  );
};

// Alternative: Minimal pulsing dots
export const LoadingMetricValueMinimal = ({
  label = 'ram'
}: { label?: 'ram' | 'nodes' }) => {
  const colorMap = {
    ram: 'text-accent',
    nodes: 'text-primary',
  };

  const shadowMap = {
    ram: 'rgba(0, 245, 255, 0.6)',
    nodes: 'rgba(212, 175, 55, 0.5)',
  };

  return (
    <motion.div
      animate={{ scale: [0.95, 1.05, 0.95] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`metric-value font-mono ${colorMap[label]}`}
      style={{
        textShadow: `0 0 8px ${shadowMap[label]}`,
        fontSize: '1.875rem',
        fontWeight: 700,
      }}
    >
      ◆
    </motion.div>
  );
};

// Alternative: Animated scanning text
export const LoadingMetricValueScanning = ({
  label = 'ram'
}: { label?: 'ram' | 'nodes' }) => {
  const colorMap = {
    ram: '#00F5FF',
    nodes: '#D4AF37',
  };

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="metric-value font-mono text-xs tracking-widest uppercase"
      style={{
        color: colorMap[label],
        textShadow: `0 0 8px ${colorMap[label]}40`,
        fontSize: '0.875rem',
        letterSpacing: '0.1em',
      }}
    >
      {label === 'ram' ? 'Scanning...' : 'Processing...'}
    </motion.div>
  );
};

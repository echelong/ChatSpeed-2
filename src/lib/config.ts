export type OptimizationMode = 'safe' | 'balanced' | 'turbo';

export interface ChatSpeedSettings {
  enabled: boolean;
  mode: OptimizationMode;
}

export interface ChatSpeedMetrics {
  renderedTurns: number;
  optimizedRequests: number;
  avoidedTurns: number;
  requestOptimizer: 'disabled' | 'armed' | 'active' | 'fallback';
  renderOptimizer: 'disabled' | 'active' | 'unsupported';
}

export const SETTINGS_KEY = 'chatspeed_settings_v2';

export const DEFAULT_SETTINGS: ChatSpeedSettings = {
  enabled: false,
  mode: 'balanced',
};

export const DEFAULT_METRICS: ChatSpeedMetrics = {
  renderedTurns: 0,
  optimizedRequests: 0,
  avoidedTurns: 0,
  requestOptimizer: 'disabled',
  renderOptimizer: 'disabled',
};

export const MODE_TARGET_TURNS: Record<
  OptimizationMode,
  number | null
> = {
  safe: null,
  balanced: 16,
  turbo: 8,
};

export function normalizeSettings(
  value?: Partial<ChatSpeedSettings>,
): ChatSpeedSettings {
  const mode: OptimizationMode =
    value?.mode === 'safe' ||
    value?.mode === 'balanced' ||
    value?.mode === 'turbo'
      ? value.mode
      : DEFAULT_SETTINGS.mode;

  return {
    enabled:
      typeof value?.enabled === 'boolean'
        ? value.enabled
        : DEFAULT_SETTINGS.enabled,
    mode,
  };
}

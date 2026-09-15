import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import './App.css';

import {
  DEFAULT_METRICS,
  DEFAULT_SETTINGS,
  MODE_TARGET_TURNS,
  normalizeSettings,
  type ChatSpeedMetrics,
  type ChatSpeedSettings,
  type OptimizationMode,
} from './lib/config';

import {
  MESSAGE_TYPES,
} from './lib/messages';

function supportsChatSpeed(
  url?: string,
): boolean {
  if (!url) return false;

  try {
    const host =
      new URL(url).hostname;

    return (
      host === 'chatgpt.com' ||
      host.endsWith('.chatgpt.com') ||
      host === 'claude.ai' ||
      host.endsWith('.claude.ai') ||
      host === 'grok.com' ||
      host.endsWith('.grok.com') ||
      host === 'gemini.google.com' ||
      host === 'chat.deepseek.com'
    );
  } catch {
    return false;
  }
}

function App() {
  const [
    tabId,
    setTabId,
  ] = useState<number | null>(null);

  const [
    supported,
    setSupported,
  ] = useState(true);

  const [
    settings,
    setSettings,
  ] = useState<ChatSpeedSettings>(
    DEFAULT_SETTINGS,
  );

  const [
    metrics,
    setMetrics,
  ] = useState<ChatSpeedMetrics>(
    DEFAULT_METRICS,
  );

  const [
    ready,
    setReady,
  ] = useState(false);

  const refresh = useCallback(
    (id: number) => {
      chrome.runtime.sendMessage(
        {
          type:
            MESSAGE_TYPES
              .GET_TAB_STATE,
          tabId: id,
        },
        (response) => {
          if (
            chrome.runtime.lastError
          ) {
            setReady(true);
            return;
          }

          setSettings(
            normalizeSettings(
              response?.settings,
            ),
          );

          setMetrics({
            ...DEFAULT_METRICS,
            ...(response?.metrics ?? {}),
          });

          setReady(true);
        },
      );
    },
    [],
  );

  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const tab = tabs[0];

        if (
          !tab?.id ||
          !supportsChatSpeed(
            tab.url,
          )
        ) {
          setSupported(false);
          setReady(true);
          return;
        }

        setSupported(true);
        setTabId(tab.id);
        refresh(tab.id);
      },
    );
  }, [refresh]);

  useEffect(() => {
    const listener = (
      message: {
        type?: string;
        tabId?: number;
        state?: Partial<ChatSpeedMetrics>;
      },
    ) => {
      if (
        message.type !==
          MESSAGE_TYPES.STATE_UPDATED ||
        message.tabId !== tabId
      ) {
        return;
      }

      setMetrics((current) => ({
        ...current,
        ...(message.state ?? {}),
      }));
    };

    chrome.runtime.onMessage
      .addListener(listener);

    return () => {
      chrome.runtime.onMessage
        .removeListener(listener);
    };
  }, [tabId]);

  useEffect(() => {
    const listener = (
      changes: {
        [key: string]:
          chrome.storage.StorageChange;
      },
      area: string,
    ) => {
      if (area !== 'local') {
        return;
      }

      const change =
        changes
          .chatspeed_settings_v2;

      if (!change) return;

      setSettings(
        normalizeSettings(
          change.newValue as
            | Partial<ChatSpeedSettings>
            | undefined,
        ),
      );
    };

    chrome.storage.onChanged
      .addListener(listener);

    return () => {
      chrome.storage.onChanged
        .removeListener(listener);
    };
  }, []);

  const updateSettings =
    useCallback(
      (
        patch:
          Partial<ChatSpeedSettings>,
      ) => {
        chrome.runtime.sendMessage(
          {
            type:
              MESSAGE_TYPES
                .UPDATE_SETTINGS,
            patch,
          },
          (response) => {
            if (
              chrome.runtime.lastError
            ) {
              return;
            }

            setSettings(
              normalizeSettings(
                response,
              ),
            );
          },
        );
      },
      [],
    );

  if (!ready) {
    return (
      <main className="popup loading">
        Loading ChatSpeed 2…
      </main>
    );
  }

  const target =
    MODE_TARGET_TURNS[
      settings.mode
    ];

  const status =
    !supported
      ? 'UNSUPPORTED'
      : !settings.enabled
        ? 'STANDBY'
        : metrics
              .requestOptimizer ===
            'fallback'
          ? 'FALLBACK'
          : 'ACTIVE';

  return (
    <main className="popup">
      <header className="header">
        <div>
          <div className="brand">
            <img
              src="/icon32.png"
              width="24"
              height="24"
              alt=""
            />

            <strong>
              ChatSpeed 2
            </strong>
          </div>

          <p>
            Long-chat accelerator
          </p>
        </div>

        <span
          className={
            settings.enabled &&
            supported
              ? 'status active'
              : 'status'
          }
        >
          {status}
        </span>
      </header>

      {!supported ? (
        <section className="panel">
          Open ChatGPT, Claude, Grok,
          Gemini or DeepSeek to use
          ChatSpeed 2.
        </section>
      ) : (
        <>
          <section className="panel master">
            <div>
              <strong>
                Acceleration
              </strong>

              <span>
                {settings.enabled
                  ? 'Enabled on this site'
                  : 'This site is untouched'}
              </span>
            </div>

            <button
              type="button"
              aria-label="Toggle ChatSpeed"
              className={
                settings.enabled
                  ? 'toggle enabled'
                  : 'toggle'
              }
              onClick={() =>
                updateSettings({
                  enabled:
                    !settings.enabled,
                })
              }
            >
              <span />
            </button>
          </section>

          <section className="panel">
            <div className="section-title">
              Optimization mode
            </div>

            <div className="modes">
              {(
                [
                  'safe',
                  'balanced',
                  'turbo',
                ] as OptimizationMode[]
              ).map((mode) => (
                <button
                  key={mode}
                  disabled={
                    !settings.enabled
                  }
                  className={
                    settings.mode ===
                    mode
                      ? 'selected'
                      : ''
                  }
                  onClick={() =>
                    updateSettings({
                      mode,
                    })
                  }
                >
                  {mode}
                </button>
              ))}
            </div>

            <p className="description">
              {settings.mode ===
                'safe' &&
                'Render optimization only. Network requests remain unchanged.'}

              {settings.mode ===
                'balanced' &&
                'ChatGPT: reduces initial history. Other supported sites: render acceleration without rewriting private requests.'}

              {settings.mode ===
                'turbo' &&
                'ChatGPT: smallest recent request window. Other supported sites: stronger render acceleration only.'}
            </p>
          </section>

          <section className="metrics">
            <Metric
              label="Render optimizer"
              value={
                metrics
                  .renderOptimizer
                  .toUpperCase()
              }
            />

            <Metric
              label="Request optimizer"
              value={
                metrics
                  .requestOptimizer
                  .toUpperCase()
              }
            />

            <Metric
              label="Rendered turns"
              value={String(
                metrics.renderedTurns,
              )}
            />

            <Metric
              label="ChatGPT target"
              value={
                target === null
                  ? 'FULL'
                  : String(target)
              }
            />

            <Metric
              label="Optimized requests"
              value={String(
                metrics
                  .optimizedRequests,
              )}
            />

            <Metric
              label="Turns avoided"
              value={String(
                metrics.avoidedTurns,
              )}
            />
          </section>

          <footer>
            No telemetry · No conversation
            storage · No forced reloads
          </footer>
        </>
      )}
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;

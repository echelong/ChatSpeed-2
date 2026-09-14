import {
  MODE_TARGET_TURNS,
  normalizeSettings,
  type ChatSpeedSettings,
} from './lib/config';

import { MESSAGE_TYPES } from './lib/messages';

const PAGE_SOURCE = 'chatspeed2';
const STYLE_ID = 'chatspeed2-render-style';

let currentSettings: ChatSpeedSettings = {
  enabled: false,
  mode: 'balanced',
};

let observer: MutationObserver | null = null;
let scheduledFrame: number | null = null;
let lastMetricTime = 0;

function injectInterceptor(): void {
  if (
    document.documentElement.dataset
      .chatspeed2Injected === '1'
  ) {
    return;
  }

  document.documentElement.dataset
    .chatspeed2Injected = '1';

  const script = document.createElement('script');

  script.src = chrome.runtime.getURL(
    'chatspeed-interceptor.js',
  );

  script.async = false;

  (
    document.documentElement ||
    document.head
  ).appendChild(script);

  script.onload = () => {
    script.remove();
  };
}

function sendMetrics(
  update: Record<string, unknown>,
): void {
  chrome.runtime.sendMessage(
    {
      type: MESSAGE_TYPES.METRICS_UPDATE,
      update,
    },
    () => {
      void chrome.runtime.lastError;
    },
  );
}

function renderedTurnCount(): number {
  return document.querySelectorAll(
    '[data-testid^="conversation-turn-"]',
  ).length;
}

function removeRenderOptimizer(): void {
  document.getElementById(STYLE_ID)?.remove();
}

function installRenderOptimizer():
  | 'active'
  | 'unsupported' {

  if (
    typeof CSS === 'undefined' ||
    !CSS.supports?.(
      'content-visibility',
      'auto',
    )
  ) {
    return 'unsupported';
  }

  if (!document.getElementById(STYLE_ID)) {
    const style =
      document.createElement('style');

    style.id = STYLE_ID;

    style.textContent = `
      [data-testid^="conversation-turn-"] {
        content-visibility: auto;
        contain-intrinsic-size: auto 500px;
      }
    `;

    (
      document.head ||
      document.documentElement
    ).appendChild(style);
  }

  return 'active';
}

function scheduleMetrics(): void {
  if (!currentSettings.enabled) {
    return;
  }

  if (scheduledFrame !== null) {
    return;
  }

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = null;

    const now = performance.now();

    if (now - lastMetricTime < 750) {
      return;
    }

    lastMetricTime = now;

    sendMetrics({
      renderedTurns: renderedTurnCount(),
    });
  });
}

function startObserver(): void {
  if (observer) {
    return;
  }

  observer = new MutationObserver(() => {
    scheduleMetrics();
  });

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true,
    },
  );

  scheduleMetrics();
}

function stopObserver(): void {
  observer?.disconnect();
  observer = null;

  if (scheduledFrame !== null) {
    cancelAnimationFrame(scheduledFrame);
    scheduledFrame = null;
  }
}

function sendConfigToPage(
  settings: ChatSpeedSettings,
): void {
  const target =
    MODE_TARGET_TURNS[settings.mode];

  try {
    localStorage.setItem(
      '__chatspeed_v2_enabled__',
      settings.enabled ? '1' : '0',
    );

    localStorage.setItem(
      '__chatspeed_v2_mode__',
      settings.mode,
    );

    if (target === null) {
      localStorage.removeItem(
        '__chatspeed_v2_num_turns__',
      );
    } else {
      localStorage.setItem(
        '__chatspeed_v2_num_turns__',
        String(target),
      );
    }
  } catch {
    // Fail open if origin storage is unavailable.
  }

  window.postMessage(
    {
      source: PAGE_SOURCE,
      type: 'config',
      enabled: settings.enabled,
      mode: settings.mode,
      targetTurns: target,
    },
    '*',
  );
}

function applySettings(
  settings: ChatSpeedSettings,
): void {
  currentSettings =
    normalizeSettings(settings);

  sendConfigToPage(currentSettings);

  if (!currentSettings.enabled) {
    removeRenderOptimizer();
    stopObserver();

    sendMetrics({
      requestOptimizer: 'disabled',
      renderOptimizer: 'disabled',
    });

    return;
  }

  const renderStatus =
    installRenderOptimizer();

  startObserver();

  sendMetrics({
    requestOptimizer:
      currentSettings.mode === 'safe'
        ? 'disabled'
        : 'armed',

    renderOptimizer: renderStatus,

    renderedTurns: renderedTurnCount(),
  });
}

window.addEventListener(
  'message',
  (event: MessageEvent) => {
    if (event.source !== window) {
      return;
    }

    if (
      event.data?.source !== PAGE_SOURCE
    ) {
      return;
    }

    if (
      event.data?.type ===
      'request-optimized'
    ) {
      sendMetrics({
        optimizedRequestsDelta: 1,

        avoidedTurnsDelta:
          typeof event.data.avoidedTurns ===
          'number'
            ? event.data.avoidedTurns
            : 0,

        requestOptimizer: 'active',
      });
    }

    if (
      event.data?.type ===
      'compatibility-fallback'
    ) {
      sendMetrics({
        requestOptimizer: 'fallback',
      });
    }
  },
);

chrome.storage.onChanged.addListener(
  (changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }

    const change =
      changes.chatspeed_settings_v2;

    if (!change) {
      return;
    }

    applySettings(
      normalizeSettings(
        change.newValue as
          | Partial<ChatSpeedSettings>
          | undefined,
      ),
    );
  },
);

injectInterceptor();

chrome.runtime.sendMessage(
  {
    type: MESSAGE_TYPES.GET_SETTINGS,
  },
  (response) => {
    if (chrome.runtime.lastError) {
      return;
    }

    applySettings(
      normalizeSettings(response),
    );
  },
);

/* CHATSPEED_ACTIVITY_START */

let chatspeedActivityTimer:
  ReturnType<typeof setTimeout> |
  undefined;

let chatspeedLastActivity = 0;

const chatspeedReportActivity = () => {
  const now = performance.now();

  if (
    now - chatspeedLastActivity <
    650
  ) {
    return;
  }

  chatspeedLastActivity = now;

  try {
    void chrome.runtime.sendMessage({
      type: "CHATSPEED_ACTIVITY",
    });
  } catch {
    // Extension may be reloading.
  }
};

const chatspeedScheduleActivity = () => {
  if (chatspeedActivityTimer) {
    clearTimeout(
      chatspeedActivityTimer,
    );
  }

  chatspeedActivityTimer =
    setTimeout(
      chatspeedReportActivity,
      90,
    );
};

try {
  void chrome.runtime.sendMessage({
    type: "CHATSPEED_READY",
  });
} catch {
  // Extension may be reloading.
}

const chatspeedActivityObserver =
  new MutationObserver(mutations => {
    const changed =
      mutations.some(
        mutation =>
          mutation.type === "childList" &&
          (
            mutation.addedNodes.length > 0 ||
            mutation.removedNodes.length > 0
          ),
      );

    if (changed) {
      chatspeedScheduleActivity();
    }
  });

const chatspeedStartActivityObserver = () => {
  const target =
    document.querySelector("main") ??
    document.body;

  if (!target) {
    return;
  }

  chatspeedActivityObserver.observe(
    target,
    {
      childList: true,
      subtree: true,
    },
  );
};

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    chatspeedStartActivityObserver,
    {
      once: true,
    },
  );
} else {
  chatspeedStartActivityObserver();
}

/* CHATSPEED_ACTIVITY_END */

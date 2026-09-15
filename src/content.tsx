import {
  MODE_TARGET_TURNS,
  normalizeSettings,
  type ChatSpeedSettings,
} from './lib/config';

import { MESSAGE_TYPES } from './lib/messages';

const PAGE_SOURCE = 'chatspeed2';
const STYLE_ID = 'chatspeed2-render-style';

type Platform =
  | 'chatgpt'
  | 'claude'
  | 'grok'
  | 'gemini'
  | 'deepseek'
  | 'unsupported';

function detectPlatform(): Platform {
  const host = window.location.hostname;

  if (
    host === 'chatgpt.com' ||
    host.endsWith('.chatgpt.com')
  ) {
    return 'chatgpt';
  }

  if (
    host === 'claude.ai' ||
    host.endsWith('.claude.ai')
  ) {
    return 'claude';
  }

  if (
    host === 'grok.com' ||
    host.endsWith('.grok.com')
  ) {
    return 'grok';
  }

  if (host === 'gemini.google.com') {
    return 'gemini';
  }

  if (host === 'chat.deepseek.com') {
    return 'deepseek';
  }

  return 'unsupported';
}

const PLATFORM = detectPlatform();

const CHATGPT_TURN_SELECTOR =
  '[data-testid^="conversation-turn-"]';

const CLAUDE_TURN_SELECTOR =
  '[data-testid="user-message"], .font-claude-response';

const GROK_TURN_SELECTOR =
  '[data-testid="assistant-message"], div.items-end .message-bubble';

const GEMINI_TURN_SELECTOR =
  'user-query, model-response, .user-query, .model-response';

const DEEPSEEK_TURN_SELECTOR =
  '[data-message-author-role="user"], .ds-markdown';

let currentSettings: ChatSpeedSettings = {
  enabled: false,
  mode: 'balanced',
};

let observer: MutationObserver | null = null;
let scheduledFrame: number | null = null;
let lastMetricTime = 0;

function injectInterceptor(): void {
  if (PLATFORM !== 'chatgpt') {
    return;
  }

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
  if (PLATFORM === 'chatgpt') {
    return document.querySelectorAll(
      CHATGPT_TURN_SELECTOR,
    ).length;
  }

  if (PLATFORM === 'claude') {
    return document.querySelectorAll(
      CLAUDE_TURN_SELECTOR,
    ).length;
  }

  if (PLATFORM === 'grok') {
    return document.querySelectorAll(
      GROK_TURN_SELECTOR,
    ).length;
  }

  if (PLATFORM === 'gemini') {
    return document.querySelectorAll(
      GEMINI_TURN_SELECTOR,
    ).length;
  }

  if (PLATFORM === 'deepseek') {
    return document.querySelectorAll(
      DEEPSEEK_TURN_SELECTOR,
    ).length;
  }

  return 0;
}

function removeRenderOptimizer(): void {
  document.getElementById(STYLE_ID)?.remove();
}

function nonChatgptIntrinsicSize(): number {
  if (currentSettings.mode === 'turbo') {
    return 360;
  }

  if (currentSettings.mode === 'balanced') {
    return 520;
  }

  return 700;
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

  let style =
    document.getElementById(
      STYLE_ID,
    ) as HTMLStyleElement | null;

  if (!style) {
    style =
      document.createElement('style');

    style.id = STYLE_ID;

    (
      document.head ||
      document.documentElement
    ).appendChild(style);
  }

  if (PLATFORM === 'chatgpt') {
    style.textContent = `
      ${CHATGPT_TURN_SELECTOR} {
        content-visibility: auto;
        contain-intrinsic-size: auto 500px;
      }
    `;
  } else if (PLATFORM === 'claude') {
    style.textContent = `
      ${CLAUDE_TURN_SELECTOR} {
        content-visibility: auto;
        contain-intrinsic-size: auto ${nonChatgptIntrinsicSize()}px;
      }
    `;
  } else if (PLATFORM === 'grok') {
    style.textContent = `
      ${GROK_TURN_SELECTOR} {
        content-visibility: auto;
        contain-intrinsic-size: auto ${nonChatgptIntrinsicSize()}px;
      }
    `;
  } else if (PLATFORM === 'gemini') {
    style.textContent = `
      ${GEMINI_TURN_SELECTOR} {
        content-visibility: auto;
        contain-intrinsic-size: auto ${nonChatgptIntrinsicSize()}px;
      }
    `;
  } else if (PLATFORM === 'deepseek') {
    style.textContent = `
      ${DEEPSEEK_TURN_SELECTOR} {
        content-visibility: auto;
        contain-intrinsic-size: auto ${nonChatgptIntrinsicSize()}px;
      }
    `;
  } else {
    removeRenderOptimizer();
    return 'unsupported';
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
  if (PLATFORM !== 'chatgpt') {
    return;
  }

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
      PLATFORM === 'chatgpt' &&
      currentSettings.mode !== 'safe'
        ? 'armed'
        : 'disabled',

    renderOptimizer: renderStatus,

    renderedTurns: renderedTurnCount(),
  });
}

window.addEventListener(
  'message',
  (event: MessageEvent) => {
    if (PLATFORM !== 'chatgpt') {
      return;
    }

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

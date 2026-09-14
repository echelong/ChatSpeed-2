import {
  DEFAULT_METRICS,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  normalizeSettings,
  type ChatSpeedMetrics,
  type ChatSpeedSettings,
} from './lib/config';

import { MESSAGE_TYPES } from './lib/messages';

function tabStorageKey(tabId: number): string {
  return `chatspeed_v2_tab_${tabId}`;
}

async function getSettings(): Promise<ChatSpeedSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);

  return normalizeSettings(
    result[SETTINGS_KEY] as
      | Partial<ChatSpeedSettings>
      | undefined,
  );
}

async function updateSettings(
  patch: Partial<ChatSpeedSettings>,
): Promise<ChatSpeedSettings> {
  const current = await getSettings();

  const next = normalizeSettings({
    ...current,
    ...patch,
  });

  await chrome.storage.local.set({
    [SETTINGS_KEY]: next,
  });

  return next;
}

async function getMetrics(
  tabId: number,
): Promise<ChatSpeedMetrics> {
  const key = tabStorageKey(tabId);
  const result = await chrome.storage.session.get(key);

  return {
    ...DEFAULT_METRICS,
    ...(result[key] as
      | Partial<ChatSpeedMetrics>
      | undefined),
  };
}

interface MetricUpdate extends Partial<ChatSpeedMetrics> {
  optimizedRequestsDelta?: number;
  avoidedTurnsDelta?: number;
}

async function updateMetrics(
  tabId: number,
  update: MetricUpdate,
): Promise<ChatSpeedMetrics> {
  const current = await getMetrics(tabId);

  const next: ChatSpeedMetrics = {
    renderedTurns:
      update.renderedTurns ?? current.renderedTurns,

    optimizedRequests:
      current.optimizedRequests +
      (update.optimizedRequestsDelta ?? 0),

    avoidedTurns:
      current.avoidedTurns +
      (update.avoidedTurnsDelta ?? 0),

    requestOptimizer:
      update.requestOptimizer ??
      current.requestOptimizer,

    renderOptimizer:
      update.renderOptimizer ??
      current.renderOptimizer,
  };

  await chrome.storage.session.set({
    [tabStorageKey(tabId)]: next,
  });

  chrome.runtime.sendMessage(
    {
      type: MESSAGE_TYPES.STATE_UPDATED,
      tabId,
      state: next,
    },
    () => {
      void chrome.runtime.lastError;
    },
  );

  return next;
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing =
    await chrome.storage.local.get(SETTINGS_KEY);

  if (!existing[SETTINGS_KEY]) {
    await chrome.storage.local.set({
      [SETTINGS_KEY]: DEFAULT_SETTINGS,
    });
  }
});

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message?.type === MESSAGE_TYPES.GET_SETTINGS) {
      getSettings().then(sendResponse);
      return true;
    }

    if (
      message?.type === MESSAGE_TYPES.UPDATE_SETTINGS
    ) {
      updateSettings(message.patch ?? {}).then(sendResponse);
      return true;
    }

    if (
      message?.type === MESSAGE_TYPES.GET_TAB_STATE
    ) {
      const tabId =
        typeof message.tabId === 'number'
          ? message.tabId
          : sender.tab?.id;

      if (typeof tabId !== 'number') {
        sendResponse({
          settings: DEFAULT_SETTINGS,
          metrics: DEFAULT_METRICS,
        });

        return;
      }

      Promise.all([
        getSettings(),
        getMetrics(tabId),
      ]).then(([settings, metrics]) => {
        sendResponse({
          settings,
          metrics,
        });
      });

      return true;
    }

    if (
      message?.type === MESSAGE_TYPES.METRICS_UPDATE
    ) {
      const tabId = sender.tab?.id;

      if (typeof tabId !== 'number') {
        return;
      }

      updateMetrics(
        tabId,
        message.update ?? {},
      ).catch(() => {
        // Fail open. ChatGPT must never be affected.
      });
    }
  },
);

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session
    .remove(tabStorageKey(tabId))
    .catch(() => {});
});

/* CHATSPEED_BADGE_START */

const chatspeedSetReadyBadge = async () => {
  try {
    await chrome.action.setBadgeText({
      text: "ON",
    });

    await chrome.action.setBadgeBackgroundColor({
      color: "#16a34a",
    });

    await chrome.action.setTitle({
      title: "ChatSpeed 2 — active",
    });
  } catch {
    // Badge feedback must never break ChatSpeed.
  }
};

let chatspeedFlashId = 0;

const chatspeedFlashBadge = async () => {
  const id = ++chatspeedFlashId;

  try {
    await chrome.action.setTitle({
      title: "ChatSpeed 2 — working",
    });

    const frames = [
      ["RUN", "#06b6d4"],
      ["", "#16a34a"],
      ["RUN", "#06b6d4"],
      ["", "#16a34a"],
      ["RUN", "#06b6d4"],
    ] as const;

    for (const [label, color] of frames) {
      if (id !== chatspeedFlashId) {
        return;
      }

      await chrome.action.setBadgeBackgroundColor({
        color,
      });

      await chrome.action.setBadgeText({
        text: label,
      });

      await new Promise<void>(
        resolve => setTimeout(resolve, 120),
      );
    }

    if (id === chatspeedFlashId) {
      await chatspeedSetReadyBadge();
    }
  } catch {
    // Ignore badge errors.
  }
};

chrome.runtime.onInstalled.addListener(() => {
  void chatspeedSetReadyBadge();
});

chrome.runtime.onStartup.addListener(() => {
  void chatspeedSetReadyBadge();
});

chrome.runtime.onMessage.addListener(message => {
  if (
    message?.type ===
    "CHATSPEED_ACTIVITY"
  ) {
    void chatspeedFlashBadge();
  }

  if (
    message?.type ===
    "CHATSPEED_READY"
  ) {
    void chatspeedSetReadyBadge();
  }
});

void chatspeedSetReadyBadge();

/* CHATSPEED_BADGE_END */

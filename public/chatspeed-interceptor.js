(function () {
  'use strict';

  if (window.__CHAT_SPEED_V2__) {
    return;
  }

  window.__CHAT_SPEED_V2__ = true;

  const SOURCE = 'chatspeed2';

  let enabled = false;
  let mode = 'balanced';
  let targetTurns = 16;

  function readStoredConfig() {
    try {
      enabled =
        localStorage.getItem(
          '__chatspeed_v2_enabled__',
        ) === '1';

      const storedMode =
        localStorage.getItem(
          '__chatspeed_v2_mode__',
        );

      if (
        storedMode === 'safe' ||
        storedMode === 'balanced' ||
        storedMode === 'turbo'
      ) {
        mode = storedMode;
      }

      const storedTarget = Number(
        localStorage.getItem(
          '__chatspeed_v2_num_turns__',
        ),
      );

      if (
        Number.isInteger(storedTarget) &&
        storedTarget >= 4 &&
        storedTarget <= 100
      ) {
        targetTurns = storedTarget;
      }
    } catch {
      enabled = false;
    }
  }

  function isTemporaryChat() {
    try {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      return (
        params.get('temporary-chat') ===
          'true' ||
        params.get('temporary-chat') === '1'
      );
    } catch {
      return false;
    }
  }

  function inspectRequest(
    input,
    init,
  ) {
    try {
      const rawUrl =
        input instanceof Request
          ? input.url
          : String(input);

      const method = String(
        init?.method ||
          (
            input instanceof Request
              ? input.method
              : 'GET'
          ),
      ).toUpperCase();

      return {
        url: new URL(
          rawUrl,
          window.location.origin,
        ),
        method,
      };
    } catch {
      return null;
    }
  }

  function isTargetRequest(details) {
    if (!details) return false;
    if (!enabled) return false;
    if (mode === 'safe') return false;
    if (isTemporaryChat()) return false;

    if (details.method !== 'GET') {
      return false;
    }

    const url = details.url;

    if (
      url.origin !==
      window.location.origin
    ) {
      return false;
    }

    if (
      !/^\/backend-api\/conversations\/[^/]+$/.test(
        url.pathname,
      )
    ) {
      return false;
    }

    if (
      !url.searchParams.has(
        'num_turns',
      )
    ) {
      return false;
    }

    if (
      url.searchParams.has('before') ||
      url.searchParams.has('cursor')
    ) {
      return false;
    }

    return true;
  }

  function rewrite(
    input,
    init,
  ) {
    const details =
      inspectRequest(input, init);

    if (!isTargetRequest(details)) {
      return {
        input,
        init,
        optimized: false,
      };
    }

    const originalTurns = Number(
      details.url.searchParams.get(
        'num_turns',
      ),
    );

    if (
      !Number.isInteger(originalTurns) ||
      originalTurns <= 0
    ) {
      window.postMessage(
        {
          source: SOURCE,
          type:
            'compatibility-fallback',
        },
        '*',
      );

      return {
        input,
        init,
        optimized: false,
      };
    }

    const target = Math.max(
      4,
      Math.min(
        targetTurns,
        originalTurns,
      ),
    );

    if (originalTurns <= target) {
      return {
        input,
        init,
        optimized: false,
      };
    }

    const nextUrl =
      new URL(details.url);

    nextUrl.searchParams.set(
      'num_turns',
      String(target),
    );

    try {
      let nextInput;

      if (input instanceof Request) {
        nextInput =
          new Request(
            nextUrl.toString(),
            input,
          );
      } else if (
        input instanceof URL
      ) {
        nextInput =
          new URL(
            nextUrl.toString(),
          );
      } else {
        nextInput =
          nextUrl.toString();
      }

      return {
        input: nextInput,
        init,
        optimized: true,
        avoidedTurns:
          originalTurns - target,
      };
    } catch {
      window.postMessage(
        {
          source: SOURCE,
          type:
            'compatibility-fallback',
        },
        '*',
      );

      return {
        input,
        init,
        optimized: false,
      };
    }
  }

  readStoredConfig();

  const previousFetch =
    window.fetch.bind(window);

  window.fetch = async function (
    input,
    init,
  ) {
    let result;

    try {
      result = rewrite(
        input,
        init,
      );
    } catch {
      result = {
        input,
        init,
        optimized: false,
      };
    }

    if (result.optimized) {
      window.postMessage(
        {
          source: SOURCE,
          type: 'request-optimized',
          avoidedTurns:
            result.avoidedTurns,
        },
        '*',
      );
    }

    return previousFetch(
      result.input,
      result.init,
    );
  };

  window.addEventListener(
    'message',
    (event) => {
      if (event.source !== window) {
        return;
      }

      if (
        event.data?.source !== SOURCE ||
        event.data?.type !== 'config'
      ) {
        return;
      }

      enabled =
        Boolean(event.data.enabled);

      if (
        event.data.mode === 'safe' ||
        event.data.mode === 'balanced' ||
        event.data.mode === 'turbo'
      ) {
        mode = event.data.mode;
      }

      if (
        Number.isInteger(
          event.data.targetTurns,
        ) &&
        event.data.targetTurns >= 4 &&
        event.data.targetTurns <= 100
      ) {
        targetTurns =
          event.data.targetTurns;
      }
    },
  );
})();

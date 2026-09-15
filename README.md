# ChatSpeed 2

**Make long ChatGPT and Claude.ai conversations lighter and faster.**

ChatSpeed 2 is an open-source Chromium browser extension designed to reduce browser rendering work in long AI conversations. It supports ChatGPT and Claude.ai with platform-specific optimizers.

Instead of deleting or modifying your conversation, ChatSpeed 2 adjusts eligible conversation requests so the browser receives a smaller recent portion of the chat.

> Keep long AI conversations usable without deleting or storing your conversation content.

**Built by Cobalt**

---

## Supported platforms

| Platform | Optimization |
| --- | --- |
| **ChatGPT** | Request-level history reduction + render optimization |
| **Claude.ai** | Render optimization using CSS `content-visibility` and containment |

Claude support deliberately does **not** rewrite Claude's private network requests. ChatSpeed accelerates long Claude conversations at the rendering layer and fails open if Claude changes its page structure.


---

## What ChatSpeed 2 does

Very large ChatGPT conversations can become increasingly heavy for the browser. More history can mean more messages to download, more text and code to process, more UI elements to render, and more browser memory usage.

ChatSpeed 2 reduces that workload before the page has to render it.

For example:

```text
Normal request

ChatGPT
   ↓
Request 100 turns
   ↓
Browser receives 100 turns


ChatSpeed 2 — Balanced

ChatGPT
   ↓
ChatSpeed detects the request
   ↓
Request reduced to 16 turns
   ↓
Browser receives 16 turns
```

Your full conversation is not deleted. ChatSpeed only changes how much recent history is requested for an eligible page load.

---

## How it works

ChatSpeed 2 runs a lightweight interceptor inside the ChatGPT page. It wraps the browser's normal `fetch()` function and watches for eligible ChatGPT conversation requests.

A request may look like:

```text
/backend-api/conversations/<conversation-id>?num_turns=...
```

When ChatSpeed recognizes a safe request, it changes only the `num_turns` value and then lets the request continue through the browser normally.

```text
ChatGPT UI
    │
    ▼
Conversation request
    │
    ▼
ChatSpeed interceptor
    │
    ├── Not eligible ─────► Original request
    │
    └── Eligible
           │
           ▼
       Reduce num_turns
           │
           ▼
       ChatGPT server
           │
           ▼
    Smaller response
           │
           ▼
     ChatGPT renderer
```

ChatSpeed does not replace ChatGPT's networking system. It makes a small request adjustment and then hands control back to the browser's original `fetch()` implementation.

---

## Optimization modes

| Mode | Target | Behavior |
| --- | ---: | --- |
| **Safe** | No reduction | Request optimization disabled |
| **Balanced** | 16 turns | Good balance between context and performance |
| **Turbo** | 8 turns | More aggressive optimization |

**Balanced** is the default mode. The extension itself starts disabled until you enable it.

---

## Safety behavior

ChatSpeed deliberately avoids modifying requests when it is not confident that optimization should be applied.

It does not rewrite:

- non-GET requests
- requests to another origin
- temporary chats
- pagination requests using `before`
- pagination requests using `cursor`
- requests without a valid `num_turns`
- requests already asking for fewer turns than the selected target
- requests while Safe mode is active

If something unexpected happens, ChatSpeed falls back to normal ChatGPT behavior.

> **Fail open. ChatGPT should continue working even if ChatSpeed cannot optimize a request.**

---

## Toolbar badge

ChatSpeed 2 includes a visible extension badge.

- **Green `ON`** means the extension is loaded and running.
- **Flashing `RUN`** appears briefly during detected ChatGPT page activity.

This gives you a quick visual confirmation that ChatSpeed is alive without opening Developer Tools.

---

## Metrics

ChatSpeed keeps lightweight per-tab runtime metrics, including:

- rendered turns
- optimized requests
- avoided turns
- request optimizer status
- render optimizer status

Runtime metrics are stored in browser session storage. Settings are stored locally using Chrome extension storage.

---

## Privacy

ChatSpeed 2 is designed to work locally inside your browser.

It does not require an external ChatSpeed server to optimize conversations.

The project is designed around these principles:

- no external ChatSpeed analytics
- no conversation database
- no remote ChatSpeed processing server
- no selling of conversation data

The optimization happens inside the active ChatGPT page.

---

## Installation

ChatSpeed 2 currently installs as an unpacked Chromium extension.

### 1. Clone the repository

```bash
git clone https://github.com/echelong/ChatSpeed-2.git
cd ChatSpeed-2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

The extension will be created in:

```text
dist/
```

### 4. Load in Chrome / Chromium

Open:

```text
chrome://extensions
```

Then:

1. Enable **Developer mode**
2. Click **Load unpacked**
3. Select the `dist` folder
4. Pin ChatSpeed 2 to your toolbar

---

## Project structure

```text
src/
├── App.tsx
│   └── Extension popup
│
├── background.ts
│   ├── Settings
│   ├── Metrics
│   └── Toolbar badge
│
├── content.tsx
│   ├── Page bridge
│   └── Activity reporting
│
└── lib/
    ├── config.ts
    └── messages.ts

public/
└── chatspeed-interceptor.js
    └── ChatGPT request interceptor
```

---

## Why optimize before rendering?

If the browser receives a huge conversation first, hiding old messages afterward does not remove all of the work that already happened.

ChatSpeed tries to reduce the workload earlier:

```text
Request less
     ↓
Receive less
     ↓
Process less
     ↓
Render less
```

That is the core idea behind ChatSpeed 2.

---

## Compatibility

ChatSpeed 2 depends on ChatGPT's current web request structure. If OpenAI changes the conversation endpoint or request format, ChatSpeed may temporarily fall back to normal ChatGPT behavior until compatibility is updated.

Normal ChatGPT behavior is preferred over forcing an unsafe optimization.

---

## Open source

ChatSpeed 2 is free to use under the **MIT License**.

You may:

- use it
- modify it
- fork it
- redistribute it
- build on it
- use it commercially

See [LICENSE](LICENSE) for the full terms.

---

## Author

**Built by Cobalt**

GitHub: [@echelong](https://github.com/echelong)

---

## Disclaimer

ChatSpeed 2 is an independent open-source project and is not affiliated with or endorsed by OpenAI.

ChatGPT is a product of OpenAI.

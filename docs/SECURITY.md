# 🛡️ Security Policy: ChatSpeed

Trust is the primary metric of **ChatSpeed**. Since the extension operates at the network layer, it is built on a strict, non-negotiable principle:
> **Your data never leaves your browser.**

---

## 🔒 Core Security Principles

ChatSpeed follows three fundamental rules to ensure user privacy and security.

### 1. No External Data Transmission
ChatSpeed is a fully self-contained system.
- **Zero Analytics:** No tracking, telemetry, or analytics tools are integrated.
- **No External APIs:** No calls are made outside of ChatGPT’s own backend endpoints.
- **No Background Sync:** No data is synchronized to any external server or cloud service.

### 2. Local-Only Memory Processing 🧠
All optimization logic runs in transient memory.
- **Volatile Execution:** Conversation data is processed in memory and immediately discarded.
- **No Disk Writes:** No chat data is written to local storage or databases.
- **No Logging:** We do not create logs containing conversation content.

### 3. Zero Persistence 💾
ChatSpeed does not have a "memory" of your conversations.
- No use of `chrome.storage` for chat content.
- No use of `localStorage` or `IndexedDB` for private data.
- There is no persistent trace of your chats once the tab is closed.

---

## 🏗️ Execution & Isolation Model

ChatSpeed operates across three isolated layers to minimize the security footprint.

#### **Layer 1: Main World (The Interceptor)**
- Operates inside the page’s execution context to intercept `window.fetch`.
- Processes incoming JSON and performs pruning logic in real-time.
- **Scope:** Active memory only.

#### **Layer 2: Content Script & Popup (The UI)**
- Manages the visual dashboard and user settings.
- Displays metrics (nodes pruned, bytes saved) based on signals from the interceptor.
- **Scope:** UI state and metric counters.

#### **Layer 3: Background Script (The Relay)**
- Acts as a message bridge between the Interceptor and the Popup.
- **Scope:** Lightweight numeric values only; never accesses or processes chat content.

---

## 🕵️ Data Handling Disclosure

| Data Type | Processed | Stored | Transmitted |
| :--- | :---: | :---: | :---: |
| **Prompts and Messages** | ✅ Yes | ❌ No | ❌ No |
| **Chat Metadata** | ✅ Yes | ❌ No | ❌ No |
| **Access Tokens / Cookies** | ❌ No | ❌ No | ❌ No |
| **IP Address / Location** | ❌ No | ❌ No | ❌ No |

---

## 🔍 Transparency & Auditing

Security is enforced through absolute transparency.
- **Open Source:** The source code is fully readable and auditable.
- **No Obfuscation:** Core logic is not hidden or minified in a way that prevents review.
- **Direct Audit:** Critical logic resides in `injected.js` and can be inspected via Browser DevTools anytime.

---

## ⚠️ Reporting a Vulnerability

If you discover a potential security issue, please report it responsibly.

> [!IMPORTANT]
> **Do not open a public issue.** Please contact the maintainer directly to report security vulnerabilities.

Include:
1. A clear description of the issue.
2. Steps to reproduce the vulnerability.
3. Any proof-of-concept code or screenshots.

Refer to the [maintainer's profile](https://github.com/danishirfan21) for contact details. We aim to acknowledge and address all security reports within **7 days**.

---

## 📜 Permissions Explained

ChatSpeed requests the absolute minimum permissions required to function.

- `scripting`: Required to inject the interceptor into the main world.
- `storage`: Used only for extension settings (e.g., if ChatSpeed is enabled/disabled).
- `host permissions` limited to ChatGPT domain (`chatgpt.com`).

---

## 🧠 Threat Model

ChatSpeed is designed to mitigate the following risks:

- Excessive memory usage from large conversation graphs
- UI performance degradation from unbounded DOM growth
- Accidental data exposure through third-party extensions

ChatSpeed does not introduce new attack surfaces because:
- It does not transmit data
- It does not persist data
- It operates only within the active tab context

---

### ⚡ Final Security Note
> **ChatSpeed does not access your data for its own use. It only removes unnecessary data before your browser processes it to keep it running fast.**

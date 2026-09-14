# 🤝 Contributing to ChatSpeed

First off, thank you for considering contributing to **ChatSpeed**.

This project is built around one core idea:
> **Make ChatGPT fast, without breaking anything.**

To maintain the high-performance standards and "Surgical" reliability of ChatSpeed, we follow a strict set of contribution principles. By contributing, you help make ChatGPT faster and more efficient for everyone.

---

## 🛠️ Development Environment

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm**
- **Google Chrome** (for testing the extension)

### Local Setup

1. **Fork** the repository to your GitHub account.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/danishirfan21/Chat-Speed.git
   cd chatspeed
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load** in Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer Mode**
   - Click **Load unpacked**
   - Select the `dist` folder in the project directory.

---

## 🧪 The Surgical Code of Conduct

ChatSpeed intercepts live network traffic. Because of this, we enforce strict engineering rules to ensure stability and user trust.

### 1. Performance First ⚡
Every change must preserve speed.
- **Latency:** No feature should introduce more than **5ms** latency to the interception loop.
- **Complexity:** Target complexity should remain **O(1)** or **O(log n)**.
- **Veto Power:** If a feature slows down the system, it will not be merged.

### 2. Privacy is Non-Negotiable 🔒
User trust is the foundation of this project.
- No external API calls.
- No data logging.
- No tracking or analytics.
- No storing of chat content under any condition.

> [!IMPORTANT]
> If a feature touches or transmits user data externally, it will be rejected immediately.

### 3. Architecture Integrity 🏗️
Keep the system clean and predictable.
- All network interception must happen in `injected.js` (Main World).
- UI state belongs in the **Content Script** or **Popup**.
- **Do not mix UI logic into the interception layer.**

---

## 📝 Submission Process

Before contributing, please follow this professional workflow:

### 1. Check Existing Issues
Look at the [Issues](https://github.com/danishirfan21/Chat-Speed/issues) tab before starting work to avoid duplicating efforts.

### 2. Create a Branch
Use clear and descriptive branch names prefixing the type of change:
- `feat/faster-parsing`
- `fix/popup-toggle-bug`
- `perf/reduce-fetch-overhead`

### 3. Commit Messages
We follow **Conventional Commits**:
- `feat:` for new features.
- `fix:` for bug fixes.
- `perf:` for performance improvements.
- `refactor:` for internal restructuring.

### 4. Open a Pull Request
Your PR description should include:
- A clear explanation of the changes.
- The rationale behind the change.
- Screenshots or screen recordings if the UI is affected.

> [!TIP]
> Keep your Pull Requests focused and minimal. Small, specific PRs are much easier to review and merge.

---

## 🎨 UI and Styling Guidelines

ChatSpeed follows a **Bento-style, dark-mode-only** system UI. The interface should feel like high-end engineering tooling, not a generic consumer app.

If you are modifying the UI:
- **Primary Color:** Use **Cyan Glow** (`#00F5FF`) for active states and highlights.
- **Typography:** Keep monospace fonts for metrics and data displays.
- **Layout:** Maintain clean spacing and minimal clutter.
- **Constraints:** Ensure all elements fit within the standard Chrome popup dimensions (max 400x600px).

---

## ⚖️ License
By contributing to ChatSpeed, you agree that your contributions will be licensed under the **GPL-3.0 License**.

## 💬 Questions?
If you're unsure about anything:
1. Open an issue for discussion.
2. Ask before implementing major architectural changes.

---

### ⚡ Final Note
Most tools try to clean the UI after it slows down.
**ChatSpeed fixes the problem before the UI even sees it.**

Let’s make the web faster, one node at a time.

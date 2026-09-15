import {
  defineConfig,
} from 'vite';

import react from
  '@vitejs/plugin-react-swc';

import {
  crx,
  defineManifest,
} from '@crxjs/vite-plugin';

const manifest =
  defineManifest({
    manifest_version: 3,

    name: 'ChatSpeed 2',

    version: '2.3.0',

    description:
      'Makes long ChatGPT, Claude.ai, Grok, Gemini and DeepSeek conversations lighter and more responsive without storing conversation content.',

    icons: {
      '16': 'icon16.png',
      '32': 'icon32.png',
      '48': 'icon48.png',
      '128': 'icon128.png',
    },

    action: {
      default_popup: 'index.html',

      default_icon: {
        '16': 'icon16.png',
        '32': 'icon32.png',
        '48': 'icon48.png',
        '128': 'icon128.png',
      },
    },

    permissions: [
      'activeTab',
      'storage',
    ],

    background: {
      service_worker:
        'src/background.ts',

      type: 'module' as const,
    },

    content_scripts: [
      {
        js: [
          'src/content.tsx',
        ],

        matches: [
          'https://chatgpt.com/*',
          'https://claude.ai/*',
          'https://grok.com/*',
          'https://gemini.google.com/*',
          'https://chat.deepseek.com/*',
        ],

        run_at:
          'document_start',
      },
    ],

    web_accessible_resources: [
      {
        resources: [
          'chatspeed-interceptor.js',
        ],

        matches: [
          'https://chatgpt.com/*',
        ],
      },
    ],
  });

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],

  build: {
    modulePreload: false,
  },
});

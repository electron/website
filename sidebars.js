module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'tutorial/quick-start',
      ],
    },
  ],
  api: [
    {
      type: 'category',
      label: 'Modules',
      items: [
        {
          type: 'category',
          label: 'Main Process',
          items: [
            'api/app',
            'api/auto-updater',
            'api/browser-view',
            'api/browser-window',
            'api/content-tracing',
            'api/crash-reporter',
            'api/desktop-capturer',
            'api/dialog',
            'api/global-shortcut',
            'api/in-app-purchase',
            'api/ipc-main',
            'api/menu',
            'api/menu-item',
            'api/native-image',
            'api/native-theme',
            'api/net',
            'api/net-log',
            'api/notification',
            'api/power-monitor',
            'api/power-save-blocker',
            'api/protocol',
            'api/screen',
            'api/session',
            'api/shell',
            'api/system-preferences',
            'api/touch-bar',
            'api/tray',
            'api/web-contents',
            'api/web-frame-main'
          ]
        },
        {
          type: 'category',
          label: 'Renderer Process',
          items: [
            'api/context-bridge',
            'api/crash-reporter',
            'api/desktop-capturer',
            'api/ipc-renderer',
            'api/native-image',
            'api/shell',
            'api/web-frame',
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Custom DOM Elements',
      items: [
        'api/file-object',
        'api/webview-tag',
        'api/window-open'
      ]
    },
    {
      type: 'category',
      label: 'API Structures',
      items: [
        'api/structures/bluetooth-device',
        'api/structures/certificate',
        'api/structures/certificate-principal',
        'api/structures/cookie'
      ]
    },
    {
      type: 'category',
      label: 'Chromium and Node.js',
      items: [
        'api/command-line-switches',
        'api/environment-variables',
        'api/process',
        'api/sandbox-option',
      ]
    },
  ]
};

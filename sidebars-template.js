// @ts-check
/**
 * Single source of truth for the docs sidebars.
 *
 * The website hosts one docs folder per Electron docs version under `docs/`
 * (`docs/latest`, `docs/next`, `docs/vX.Y.Z`), so doc IDs are prefixed with
 * the folder name (`latest/api/app`). `createSidebars(prefix)` returns the
 * sidebar structure for one such prefix:
 *
 * - `sidebars.js` exports `createSidebars('latest/')` for the main site
 * - `sidebars.versioned.js` exports `createSidebars('<version>/')` for the
 *   per-version builds, filtered down to the docs that exist in that version
 *
 * New docs only need to be added here.
 */

/**
 * @typedef {import('@docusaurus/plugin-content-docs').SidebarsConfig} SidebarsConfig
 * @typedef {string | { [key: string]: any }} SidebarItem
 */

/**
 * @param {string} prefix The doc ID prefix, including the trailing slash
 * (e.g. `latest/` or `v44.3.0/`)
 * @returns {SidebarsConfig}
 */
function createSidebars(prefix) {
  return {
    docs: [
      {
        type: 'category',
        label: 'Get Started',
        items: [
          `${prefix}tutorial/introduction`,
          `${prefix}why-electron`,
          {
            type: 'category',
            label: 'Tutorial',
            items: [
              `${prefix}tutorial/tutorial-1-prerequisites`,
              `${prefix}tutorial/tutorial-2-first-app`,
              `${prefix}tutorial/tutorial-3-preload`,
              `${prefix}tutorial/tutorial-4-adding-features`,
              `${prefix}tutorial/tutorial-5-packaging`,
              `${prefix}tutorial/tutorial-6-publishing-updating`,
            ],
          },
        ],
      },
      {
        type: 'category',
        label: 'Processes in Electron',
        items: [
          `${prefix}tutorial/process-model`,
          `${prefix}tutorial/context-isolation`,
          `${prefix}tutorial/ipc`,
          `${prefix}tutorial/sandbox`,
          `${prefix}tutorial/message-ports`,
        ],
      },
      {
        type: 'category',
        label: 'Best Practices',
        items: [`${prefix}tutorial/performance`, `${prefix}tutorial/security`],
      },
      {
        type: 'category',
        label: 'Examples',
        link: { type: 'doc', id: `${prefix}tutorial/examples` },
        items: [
          `${prefix}tutorial/dark-mode`,
          `${prefix}tutorial/devices`,
          {
            type: 'doc',
            id: `${prefix}tutorial/in-app-purchases`,
            customProps: { platforms: ['mac'] },
          },
          `${prefix}tutorial/keyboard-shortcuts`,
          `${prefix}tutorial/launch-app-from-url-in-another-app`,
          {
            type: 'doc',
            id: `${prefix}tutorial/linux-desktop-actions`,
            customProps: { platforms: ['linux'] },
          },
          {
            type: 'category',
            label: 'Menus',
            link: { type: 'doc', id: `${prefix}tutorial/menus` },
            items: [
              `${prefix}tutorial/application-menu`,
              `${prefix}tutorial/context-menu`,
              {
                type: 'doc',
                id: `${prefix}tutorial/macos-dock`,
                customProps: { platforms: ['mac'] },
              },
              `${prefix}tutorial/tray`,
              `${prefix}tutorial/keyboard-shortcuts`,
            ],
          },
          `${prefix}tutorial/multithreading`,
          `${prefix}tutorial/native-file-drag-drop`,
          `${prefix}tutorial/navigation-history`,
          `${prefix}tutorial/notifications`,
          `${prefix}tutorial/offscreen-rendering`,
          `${prefix}tutorial/online-offline-events`,
          `${prefix}tutorial/progress-bar`,
          {
            type: 'doc',
            id: `${prefix}tutorial/recent-documents`,
            customProps: { platforms: ['mac', 'windows'] },
          },
          {
            type: 'doc',
            id: `${prefix}tutorial/represented-file`,
            customProps: { platforms: ['mac'] },
          },
          `${prefix}tutorial/spellchecker`,
          `${prefix}tutorial/web-embeds`,
          {
            type: 'doc',
            id: `${prefix}tutorial/windows-taskbar`,
            customProps: { platforms: ['windows'] },
          },
          {
            type: 'category',
            label: 'Window Customization',
            link: { type: 'doc', id: `${prefix}tutorial/window-customization` },
            items: [
              `${prefix}tutorial/custom-title-bar`,
              `${prefix}tutorial/custom-window-interactions`,
              `${prefix}tutorial/custom-window-styles`,
            ],
          },
        ],
      },
      {
        type: 'category',
        label: 'Development',
        items: [
          `${prefix}tutorial/accessibility`,
          `${prefix}tutorial/installation`,
          `${prefix}tutorial/asar-archives`,
          `${prefix}tutorial/asar-integrity`,
          `${prefix}tutorial/boilerplates-and-clis`,
          `${prefix}tutorial/esm`,
          `${prefix}tutorial/fuses`,
          `${prefix}tutorial/window-state-persistence`,
          `${prefix}tutorial/windows-arm`,
        ],
      },
      {
        type: 'category',
        label: 'Native Node Modules',
        items: [
          `${prefix}tutorial/using-native-node-modules`,
          {
            type: 'category',
            label: 'Tutorial: Native Code and Electron',
            items: [
              `${prefix}tutorial/native-code-and-electron`,
              `${prefix}tutorial/native-code-and-electron-cpp-win32`,
              `${prefix}tutorial/native-code-and-electron-swift-macos`,
              `${prefix}tutorial/native-code-and-electron-cpp-linux`,
            ],
          },
        ],
      },
      {
        type: 'category',
        label: 'Distribution',
        items: [
          `${prefix}tutorial/forge-overview`,
          {
            type: 'category',
            label: 'Advanced Reference',
            link: {
              type: 'doc',
              id: `${prefix}tutorial/distribution-overview`,
            },
            items: [
              `${prefix}tutorial/application-distribution`,
              `${prefix}tutorial/code-signing`,
              `${prefix}tutorial/updates`,
              {
                type: 'category',
                label: 'App Store Guides',
                items: [
                  `${prefix}tutorial/mac-app-store-submission-guide`,
                  `${prefix}tutorial/windows-store-guide`,
                  `${prefix}tutorial/snapcraft`,
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'category',
        label: 'Testing And Debugging',
        items: [
          `${prefix}tutorial/automated-testing`,
          `${prefix}tutorial/debugging-main-process`,
          `${prefix}tutorial/debugging-vscode`,
          `${prefix}tutorial/repl`,
          `${prefix}tutorial/devtools-extension`,
          `${prefix}tutorial/application-debugging`,
          `${prefix}tutorial/testing-on-headless-ci`,
        ],
      },
      {
        type: 'category',
        label: 'References',
        items: [
          `${prefix}breaking-changes`,
          `${prefix}tutorial/electron-timelines`,
          `${prefix}tutorial/electron-versioning`,
          `${prefix}faq`,
          `${prefix}glossary`,
        ],
      },
      {
        type: 'category',
        label: 'Contributing',
        items: [
          {
            type: 'category',
            label: 'Build Instructions',
            link: {
              type: 'doc',
              id: `${prefix}development/build-instructions-gn`,
            },
            items: [
              `${prefix}development/build-instructions-linux`,
              `${prefix}development/build-instructions-macos`,
              `${prefix}development/build-instructions-windows`,
              `${prefix}development/reclient`,
            ],
          },
          {
            type: 'category',
            label: 'Debugging',
            link: { type: 'doc', id: `${prefix}development/debugging` },
            items: [
              `${prefix}development/debugging-on-macos`,
              `${prefix}development/debugging-on-windows`,
              `${prefix}development/debugging-with-xcode`,
              `${prefix}development/debugging-with-symbol-server`,
            ],
          },
          {
            type: 'category',
            label: 'Development Guides',
            items: [
              `${prefix}development/api-history-migration-guide`,
              `${prefix}development/clang-tidy`,
              `${prefix}development/coding-style`,
              `${prefix}development/creating-api`,
              `${prefix}development/patches`,
              `${prefix}development/source-code-directory-structure`,
              `${prefix}development/style-guide`,
              `${prefix}development/testing`,
            ],
          },
          {
            type: 'category',
            label: 'GitHub',
            items: [
              `${prefix}development/issues`,
              `${prefix}development/pull-requests`,
            ],
          },
          {
            type: 'category',
            label: 'Upstream Development',
            items: [
              `${prefix}development/chromium-development`,
              `${prefix}development/v8-development`,
            ],
          },
        ],
      },
    ],
    api: [
      {
        type: 'category',
        label: 'Main Process Modules',
        items: [
          `${prefix}api/app`,
          `${prefix}api/auto-updater`,
          `${prefix}api/base-window`,
          {
            type: 'doc',
            id: `${prefix}api/browser-view`,
            customProps: { deprecated: true },
          },
          `${prefix}api/browser-window`,
          `${prefix}api/clipboard`,
          `${prefix}api/content-tracing`,
          `${prefix}api/crash-reporter`,
          `${prefix}api/desktop-capturer`,
          `${prefix}api/dialog`,
          `${prefix}api/global-shortcut`,
          `${prefix}api/image-view`,
          `${prefix}api/in-app-purchase`,
          `${prefix}api/ipc-main`,
          `${prefix}api/menu`,
          `${prefix}api/menu-item`,
          `${prefix}api/message-channel-main`,
          `${prefix}api/message-port-main`,
          `${prefix}api/native-image`,
          `${prefix}api/native-theme`,
          `${prefix}api/net`,
          `${prefix}api/net-log`,
          `${prefix}api/notification`,
          `${prefix}api/power-monitor`,
          `${prefix}api/power-save-blocker`,
          `${prefix}api/process`,
          `${prefix}api/protocol`,
          `${prefix}api/push-notifications`,
          `${prefix}api/safe-storage`,
          `${prefix}api/screen`,
          `${prefix}api/session`,
          `${prefix}api/shared-texture`,
          `${prefix}api/share-menu`,
          `${prefix}api/shell`,
          `${prefix}api/system-preferences`,
          `${prefix}api/touch-bar`,
          `${prefix}api/tray`,
          `${prefix}api/utility-process`,
          `${prefix}api/web-contents`,
          `${prefix}api/web-contents-view`,
          `${prefix}api/web-frame-main`,
          `${prefix}api/view`,
        ],
      },
      {
        type: 'category',
        label: 'Renderer Process Modules',
        items: [
          `${prefix}api/clipboard`,
          `${prefix}api/context-bridge`,
          `${prefix}api/crash-reporter`,
          `${prefix}api/ipc-renderer`,
          `${prefix}api/native-image`,
          `${prefix}api/web-frame`,
          `${prefix}api/web-utils`,
        ],
      },
      {
        type: 'category',
        label: 'Utility Process Modules',
        items: [
          `${prefix}api/net`,
          `${prefix}api/parent-port`,
          `${prefix}api/system-preferences`,
        ],
      },
      {
        type: 'category',
        label: 'Custom DOM Elements',
        items: [`${prefix}api/webview-tag`, `${prefix}api/window-open`],
      },
      {
        type: 'category',
        label: 'Chromium and Node.js',
        items: [
          `${prefix}api/command-line-switches`,
          `${prefix}api/environment-variables`,
          `${prefix}api/extensions`,
        ],
      },
      {
        type: 'category',
        label: 'Classes',
        items: [
          `${prefix}api/client-request`,
          `${prefix}api/command-line`,
          `${prefix}api/cookies`,
          `${prefix}api/debugger`,
          `${prefix}api/dock`,
          `${prefix}api/download-item`,
          `${prefix}api/extensions-api`,
          `${prefix}api/incoming-message`,
          `${prefix}api/navigation-history`,
          `${prefix}api/service-worker-main`,
          `${prefix}api/service-workers`,
          `${prefix}api/touch-bar-button`,
          `${prefix}api/touch-bar-color-picker`,
          `${prefix}api/touch-bar-group`,
          `${prefix}api/touch-bar-label`,
          `${prefix}api/touch-bar-other-items-proxy`,
          `${prefix}api/touch-bar-popover`,
          `${prefix}api/touch-bar-scrubber`,
          `${prefix}api/touch-bar-segmented-control`,
          `${prefix}api/touch-bar-slider`,
          `${prefix}api/touch-bar-spacer`,
          `${prefix}api/web-request`,
        ],
      },
      {
        type: 'category',
        label: 'API Structures',
        items: [
          `${prefix}api/structures/base-window-options`,
          `${prefix}api/structures/bluetooth-device`,
          `${prefix}api/structures/browser-window-options`,
          `${prefix}api/structures/certificate`,
          `${prefix}api/structures/certificate-principal`,
          `${prefix}api/structures/color-space`,
          `${prefix}api/structures/cookie`,
          `${prefix}api/structures/cpu-usage`,
          `${prefix}api/structures/crash-report`,
          `${prefix}api/structures/custom-scheme`,
          `${prefix}api/structures/desktop-capturer-source`,
          `${prefix}api/structures/display`,
          `${prefix}api/structures/extension`,
          `${prefix}api/structures/extension-info`,
          `${prefix}api/structures/file-filter`,
          `${prefix}api/structures/file-path-with-headers`,
          `${prefix}api/structures/filesystem-permission-request`,
          `${prefix}api/structures/gpu-feature-status`,
          `${prefix}api/structures/hid-device`,
          `${prefix}api/structures/input-event`,
          `${prefix}api/structures/ipc-main-event`,
          `${prefix}api/structures/ipc-main-invoke-event`,
          `${prefix}api/structures/ipc-renderer-event`,
          `${prefix}api/structures/jump-list-category`,
          `${prefix}api/structures/jump-list-item`,
          `${prefix}api/structures/keyboard-event`,
          `${prefix}api/structures/keyboard-input-event`,
          `${prefix}api/structures/media-access-permission-request`,
          `${prefix}api/structures/memory-info`,
          `${prefix}api/structures/memory-usage-details`,
          `${prefix}api/structures/mime-typed-buffer`,
          `${prefix}api/structures/mouse-input-event`,
          `${prefix}api/structures/mouse-wheel-input-event`,
          `${prefix}api/structures/navigation-entry`,
          `${prefix}api/structures/notification-action`,
          `${prefix}api/structures/notification-response`,
          `${prefix}api/structures/offscreen-shared-texture`,
          `${prefix}api/structures/open-external-permission-request`,
          `${prefix}api/structures/payment-discount`,
          `${prefix}api/structures/permission-request`,
          `${prefix}api/structures/point`,
          `${prefix}api/structures/post-body`,
          `${prefix}api/structures/printer-info`,
          `${prefix}api/structures/process-memory-info`,
          `${prefix}api/structures/process-metric`,
          `${prefix}api/structures/product`,
          `${prefix}api/structures/product-discount`,
          `${prefix}api/structures/product-subscription-period`,
          `${prefix}api/structures/protocol-request`,
          `${prefix}api/structures/protocol-response`,
          `${prefix}api/structures/protocol-response-upload-data`,
          `${prefix}api/structures/proxy-config`,
          `${prefix}api/structures/rectangle`,
          `${prefix}api/structures/referrer`,
          `${prefix}api/structures/render-process-gone-details`,
          `${prefix}api/structures/resolved-endpoint`,
          `${prefix}api/structures/resolved-host`,
          `${prefix}api/structures/scrubber-item`,
          `${prefix}api/structures/segmented-control-segment`,
          `${prefix}api/structures/serial-port`,
          `${prefix}api/structures/service-worker-info`,
          `${prefix}api/structures/shared-worker-info`,
          `${prefix}api/structures/sharing-item`,
          `${prefix}api/structures/shortcut-details`,
          `${prefix}api/structures/size`,
          `${prefix}api/structures/task`,
          `${prefix}api/structures/thumbar-button`,
          `${prefix}api/structures/trace-categories-and-options`,
          `${prefix}api/structures/trace-config`,
          `${prefix}api/structures/transaction`,
          `${prefix}api/structures/upload-data`,
          `${prefix}api/structures/upload-file`,
          `${prefix}api/structures/upload-raw-data`,
          `${prefix}api/structures/usb-device`,
          `${prefix}api/structures/user-default-types`,
          `${prefix}api/structures/web-preferences`,
          `${prefix}api/structures/web-request-filter`,
          `${prefix}api/structures/web-source`,
          `${prefix}api/structures/window-open-handler-response`,
          `${prefix}api/structures/shared-dictionary-info`,
          `${prefix}api/structures/shared-dictionary-usage-info`,
        ],
      },
    ],
  };
}

/**
 * @param {unknown} item
 * @returns {item is string}
 */
const isDocShorthand = (item) => typeof item === 'string';

/**
 * Removes every doc item whose document does not exist, so that the same
 * sidebar template can be used for older docs versions that predate some
 * pages (Docusaurus fails the build on unknown doc IDs). Categories that end
 * up empty are dropped; category links to missing docs are removed while the
 * category itself is kept; `customProps` and every other item property are
 * preserved.
 *
 * @param {SidebarItem[]} items
 * @param {(docId: string) => boolean} docExists
 * @returns {SidebarItem[]}
 */
function filterSidebarItems(items, docExists) {
  /** @type {SidebarItem[]} */
  const result = [];

  for (const item of items) {
    if (isDocShorthand(item)) {
      if (docExists(item)) result.push(item);
      continue;
    }

    if (typeof item !== 'object' || item === null) {
      result.push(item);
      continue;
    }

    if (item.type === 'doc') {
      if (docExists(item.id)) result.push(item);
      continue;
    }

    if (item.type === 'category') {
      const children = filterSidebarItems(item.items, docExists);
      if (children.length === 0) continue;

      /** @type {{ [key: string]: any }} */
      const category = { ...item, items: children };
      if (category.link?.type === 'doc' && !docExists(category.link.id)) {
        delete category.link;
      }
      result.push(category);
      continue;
    }

    // `link`, `html`, `ref`, autogenerated... are kept as-is
    result.push(item);
  }

  return result;
}

/**
 * Applies {@link filterSidebarItems} to every sidebar of a sidebars config.
 *
 * @param {SidebarsConfig} sidebars
 * @param {(docId: string) => boolean} docExists
 * @returns {SidebarsConfig}
 */
function filterSidebars(sidebars, docExists) {
  /** @type {SidebarsConfig} */
  const result = {};

  for (const [name, items] of Object.entries(sidebars)) {
    result[name] = Array.isArray(items)
      ? /** @type {SidebarsConfig[string]} */ (
          filterSidebarItems(/** @type {SidebarItem[]} */ (items), docExists)
        )
      : items;
  }

  return result;
}

module.exports = { createSidebars, filterSidebarItems, filterSidebars };

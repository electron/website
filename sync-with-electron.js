// TODO: DELETE WHEN DOCS ARE MERGED UPSTREAM!
// DO NOT MERGE INTO ELECTRONJS.ORG-NEW REPO!!
const fs = require('fs-extra');
const path = require('path');

const mdFiles = [
  'application-distribution.md',
  'code-signing.md',
  'dark-mode.md',
  'devices.md',
  'distribution.md',
  'examples.md',
  'in-app-purchases.md',
  'introduction.md',
  'keyboard-shortcuts.md',
  'launch-app-from-url-in-another-app.md',
  'linux-desktop-actions.md',
  'mac-app-store-submission-guide.md',
  'macos-dock.md',
  'message-ports.md',
  'native-file-drag-drop.md',
  'notifications.md',
  'offscreen-rendering.md',
  'online-offline-events.md',
  'os-integration.md',
  'process-model.md',
  'progress-bar.md',
  'recent-documents.md',
  'represented-file.md',
  'spellchecker.md',
  'tray.md',
  'tutorial-adding-features.md',
  'tutorial-main-renderer.md',
  'tutorial-prerequisites.md',
  'tutorial-scaffolding.md',
  'updates.md',
  'web-embeds.md',
  'window-customization.md',
  'windows-arm.md',
  'windows-store-guide.md',
  'windows-taskbar.md',
];

const imgFiles = ['vscode-debugger.png'];

const fiddles = ['tutorial-main-renderer', 'windows-lifecycle'];

const copy = async () => {
  for (const file of mdFiles) {
    const inPath = path.join(__dirname, 'docs', 'latest', 'tutorial', file);
    const outPath = path.join(
      __dirname,
      '..',
      'electron',
      'docs',
      'tutorial',
      file
    );

    const content = await fs.readFile(inPath, 'utf-8');
    const transformedContent = content
      .replace(/\slatest\/tutorial\//g, ' ')
      .replace(/\(latest\/tutorial\//g, '(')
      .replace(/\slatest\/api/g, ' ../api')
      .replace(/\(latest\/api/g, '(../api')
      .replace(/\slatest\/development/g, ' ../development')
      .replace(/\(latest\/development/g, '(../development');

    await fs.writeFile(outPath, transformedContent, 'utf-8');
  }

  for (const file of imgFiles) {
    await fs.copy(
      path.join(__dirname, 'docs', 'latest', 'images', file),
      path.join(__dirname, '..', 'electron', 'docs', 'images', file),
      { overwrite: true }
    );
  }

  for (const fiddle of fiddles) {
    await fs.copy(
      path.join(__dirname, 'docs', 'latest', 'fiddles', fiddle),
      path.join(__dirname, '..', 'electron', 'docs', 'fiddles', fiddle),
      { overwrite: true }
    );
  }
};

copy();

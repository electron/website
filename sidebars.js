module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'introduction',
        'what-is-electron',
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
            'api/accelerator',
            'api/app',
            'api/auto-updater'
          ]
        },
        {
          type: 'category',
          label: 'Renderer Process',
          items: [
            'api/accelerator',
            'api/app',
            'api/auto-updater'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Custom DOM Elements',
      items: [
        'api/accelerator',
        'api/app',
        'api/auto-updater'
      ]
    },
    {
      type: 'category',
      label: 'API Structures',
      items: [
        'api/accelerator',
        'api/app',
        'api/auto-updater'
      ]
    },
    {
      type: 'category',
      label: 'Chromium and Node.js',
      items: [
        'api/accelerator',
        'api/app',
        'api/auto-updater'
      ]
    },
  ]
};

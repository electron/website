// This file is loaded whenever a javascript context is created. It runs in a
// private scope that can access a subset of Electron renderer APIs. Without
// contextIsolation enabled, it's possible to accidentally leak privileged
// globals like ipcRenderer to web content.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  sayHello: () => ipcRenderer.invoke('say-hello'),
});

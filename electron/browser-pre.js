// Preload for the automation-browser toolbar (safe bridge, no node in renderer).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('stb', {
  refresh: () => ipcRenderer.invoke('tabs:list'),
  newTab: (url, name, options) => ipcRenderer.invoke('tabs:new', { url, name, ...(options || {}) }),
  get: () => ipcRenderer.invoke('tabs:get'),
  layoutStatus: () => ipcRenderer.invoke('tabs:layout-status'),
  repairLayout: (reason) => ipcRenderer.invoke('tabs:repair-layout', reason || 'toolbar-request'),
  activateByName: (name) => ipcRenderer.invoke('tabs:activate-name', name),
  close: (id) => ipcRenderer.invoke('tabs:close', id),
  activate: (id) => ipcRenderer.invoke('tabs:activate', id),
  nav: (id, url) => ipcRenderer.invoke('tabs:nav', { id, url }),
  back: (id) => ipcRenderer.invoke('tabs:back', id),
  fwd: (id) => ipcRenderer.invoke('tabs:fwd', id),
  reload: (id) => ipcRenderer.invoke('tabs:reload', id),
  onUpdate: (fn) => ipcRenderer.on('tabs:update', (e, tabs, active) => fn(tabs, active)),
});

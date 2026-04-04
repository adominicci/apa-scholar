interface ElectronPrintBridge {
  onExportData: (handler: (event: unknown, data: unknown) => void) => void;
  removeExportDataListener: (handler: (event: unknown, data: unknown) => void) => void;
  signalReady: () => void;
  signalRendered: () => void;
}

interface Window {
  electronPrintBridge?: ElectronPrintBridge;
}

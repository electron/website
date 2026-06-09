import { ElectronVersions } from '@electron/fiddle-core';

let _latestElectronVersionPromise: Promise<string> | undefined;

export async function latestElectronVersion(): Promise<string> {
  if (_latestElectronVersionPromise) {
    return _latestElectronVersionPromise;
  }

  _latestElectronVersionPromise = (async () => {
    const versions = await ElectronVersions.create();
    return versions.latestStable.version;
  })();

  return _latestElectronVersionPromise;
}

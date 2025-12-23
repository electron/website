import { ElectronVersions } from '@electron/fiddle-core';

export async function latestElectronVersion(): Promise<string> {
  const versions = await ElectronVersions.create();
  return versions.latestStable.version;
}

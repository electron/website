import React from 'react';

import LinuxIcon from '@site/static/assets/img/platform-linux.svg';
import MacIcon from '@site/static/assets/img/platform-mac.svg';
import WindowsIcon from '@site/static/assets/img/platform-windows.svg';

export default function TagContent({ platform }) {
  switch (platform) {
    case 'windows':
      //@ts-expect-error
      return <WindowsIcon role="img" title="Available on Windows" />;
    case 'mac':
      //@ts-expect-error
      return <MacIcon role="img" title="Available on macOS" />;
    case 'linux':
      //@ts-expect-error
      return <LinuxIcon role="img" title="Available on Linux" />;
    default:
      return <span />;
  }
}

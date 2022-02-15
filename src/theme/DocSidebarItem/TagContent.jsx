import React from 'react';

import LinuxIcon from '@site/static/assets/img/platform-linux.svg';
import MacIcon from '@site/static/assets/img/platform-mac.svg';
import WindowsIcon from '@site/static/assets/img/platform-windows.svg';

export default function TagContent({ platform }) {
  switch (platform) {
    case 'windows':
      return <WindowsIcon role="img"/>;
    case 'mac':
      return <MacIcon role="img"/>;
    case 'linux':
      return <LinuxIcon role="img"/>;
    default:
      return;
  }
}

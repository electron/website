const fs = require('fs-extra');
const got = require('got');
const gunzip = require('gunzip-maybe');
const path = require('path');
const tar = require('tar');

const tarballUrl = `https://github.com/electron/electron/archive/12-x-y.tar.gz`

async function main() {
  await fs.remove('docs');
  await fs.mkdirp('docs');
  await got.stream(tarballUrl)
    .pipe(gunzip())
    .pipe(tar.extract({
      cwd: path.join(process.cwd(), 'docs'),
      filter: (path, _stat) => {
        return path.includes('docs');
      },
      strip: 2
    }))
}

main();

import path from 'path';
import execa, { Options } from 'execa';

/**
 * Groups all string arguments into a single one. E.g.:
 * ```js
 * ['-m', '"Upgrade:', 'to', 'latest', 'version"'] --> ['-m', '"Upgrade: to latest version"']`
 * ```
 *
 * Original code writeng by @molant for webhint/hint.
 * Distributed under an Apache-2.0 License
 *
 * https://github.com/webhintio/hint/blob/606fee86054a54aa55a598fdc6d86400d1269851/release/lib/utils.ts#L78
 */
const groupArgs = (args: string[]) => {
  let isStringArgument = false;
  const newArgs = args.reduce((acum, current) => {
    if (isStringArgument) {
      const last = acum[acum.length - 1];

      acum[acum.length - 1] = `${last} ${current}`.replace(/"/g, '');

      if (current.endsWith('"')) {
        isStringArgument = false;
      }

      return acum;
    }

    if (current.startsWith('"')) {
      /**
       * Argument is split. I.e.: `['"part1', 'part2"'];`
       */
      if (!current.endsWith('"')) {
        isStringArgument = true;

        acum.push(current);

        return acum;
      }

      /**
       * Argument is surrounded by "" that need to be removed.
       * We just remove all the quotes because we don't escape any in our commands
       */
      acum.push(current.replace(/"/g, ''));

      return acum;
    }

    acum.push(current);

    return acum;
  }, []);

  return newArgs;
};

/**
 * Executes the given `command` using `execa` and doing the
 * required transformations (e.g.: splitting and grouping arguments).
 */
export const execute = (command: string, options?: Options) => {
  console.log(
    `${options && options.cwd ? options.cwd : process.cwd()}${
      path.sep
    }${command}`
  );

  const args = command.split(' ');
  const program = args.shift();

  return execa(program, groupArgs(args), options);
};

/**
 * Converts an array of objects to a CSV string
 * @param arr Array of objects
 * @returns A string with the object in CSV format
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToCSV(arr: any[]) {
  return arr
    .map((it) => {
      return Object.values(it)
        .map((a) => `"${a}"`) // quote all the things
        .toString();
    })
    .join('\n');
}

/**
 *
 * @param {string} utmMedium
 * @returns {(urlAddress: string) => string}
 */
export function addUTM(utmMedium) {
  /**
   * @param {string} urlAddress
   */
  return function (urlAddress) {
    const url = new URL(urlAddress);
    url.searchParams.append('utm_source', 'electron');
    url.searchParams.append('utm_medium', utmMedium);

    return url.toString();
  };
}

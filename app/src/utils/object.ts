/**
 * Recursively finds a nested property within an object using a dot-separated string.
 * @param {string} resultToFind - The dot-separated path to the desired property (e.g., "outlines.top.svg").
 * @param {unknown} resultsToSearch - The object to search within.
 * @returns {unknown | undefined} The found property value, or undefined if not found.
 */
export const findResult = (
  resultToFind: string,
  resultsToSearch: unknown
): unknown | undefined => {
  if (resultsToSearch === null) return null;
  if (resultToFind === '') return resultsToSearch;
  if (typeof resultsToSearch !== 'object') return undefined;
  const properties = resultToFind.split('.');
  const currentProperty = properties[0];
  const remainingProperties = properties.slice(1).join('.');
  return Object.prototype.hasOwnProperty.call(resultsToSearch, currentProperty)
    ? findResult(
        remainingProperties,
        (resultsToSearch as Record<string, unknown>)[currentProperty]
      )
    : undefined;
};

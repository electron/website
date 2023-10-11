export const PaginationRange = (totalPage, page, siblings) => {
  let totalPageNoInArray = 7 + siblings;
  if (totalPageNoInArray >= totalPage) {
    return Array.from({ length: totalPage }, (_, i) => i + 1);
  }

  let leftSiblingsIndex = Math.max(page - siblings, 1);
  let rightSiblingsIndex = Math.min(page + siblings, totalPage);
  let showLeftDots = leftSiblingsIndex > 2;
  let showRightDots = rightSiblingsIndex < totalPage - 2;

  if (!showLeftDots && showRightDots) {
    let leftItemsCount = 3 + 2 * siblings;
    let leftRange = Array.from({ length: leftItemsCount }, (_, i) => i + 1);
    return [...leftRange, '...', totalPage];
  } else if (showLeftDots && !showRightDots) {
    let rightItemsCount = 3 + 2 * siblings;
    let rightRange = Array.from(
      { length: rightItemsCount },
      (_, i) => totalPage - rightItemsCount + i + 1
    );
    return [1, '...', ...rightRange];
  } else {
    let middleRange = Array.from(
      { length: rightSiblingsIndex - leftSiblingsIndex + 1 },
      (_, i) => leftSiblingsIndex + i
    );
    return [1, '...', ...middleRange, '...', totalPage];
  }
};

export const chunk = (array: any[], length: number): any[][] => {
  const chunks: any[][] = [];
  let i, j;
  for (i = 0, j = array.length; i < j; i += length) {
    // do whatever
    chunks.push(array.slice(i, i + length));
  }
  return chunks;
};

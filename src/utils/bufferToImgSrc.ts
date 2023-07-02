export const bufferToImgSrc = (buffer: Buffer): string => {
  const dataUri = `data:image/png;base64,${Buffer.from(buffer).toString(
    'base64'
  )}`;
  return dataUri;
};

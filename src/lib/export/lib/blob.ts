export function toBlob(
  value: Blob | ArrayBuffer | Uint8Array | string,
  type: string,
): Blob {
  if (typeof Blob !== "undefined" && value instanceof Blob) return value;
  if (value instanceof Uint8Array) {
    const copy = new Uint8Array(value);
    return new Blob([copy.buffer], { type });
  }
  return new Blob([value], { type });
}

export function clientPlainText(value: string, max = 120) {
  return value.normalize("NFKC")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[<>]/g, "")
    .slice(0, max);
}

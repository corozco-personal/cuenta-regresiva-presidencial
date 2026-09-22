type PlainTextOptions = { min?: number; max: number; multiline?: boolean; optional?: boolean };

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const MARKUP_OR_TEMPLATE = /<\/?[a-z!][^>]*>|<\?(?:php)?|\?>|\{\{|\}\}|\$\{/i;
const ACTIVE_INJECTION = /(?:javascript|data|vbscript)\s*:|on(?:error|load|click)\s*=|<\s*(?:script|iframe|object|embed|svg)|(?:union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+\w+\s+set)|(?:\.\.\/){2,}|(?:\$where|__proto__|constructor\s*\[)/i;

export function hasInjectionPattern(value: unknown) {
  return ACTIVE_INJECTION.test(String(value ?? "")) || MARKUP_OR_TEMPLATE.test(String(value ?? ""));
}

export function plainText(value: unknown, options: PlainTextOptions) {
  let text = String(value ?? "").normalize("NFKC").replace(CONTROL_CHARACTERS, "");
  text = options.multiline
    ? text.replace(/\r\n?/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
    : text.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!text && options.optional) return "";
  if (text.length < (options.min ?? 1) || text.length > options.max || hasInjectionPattern(text)) throw new Error("invalid-text");
  return text;
}

export function httpsUrl(value: unknown) {
  const raw = String(value ?? "").trim();
  if (raw.length < 10 || raw.length > 2048 || /[\u0000-\u001f\u007f]/.test(raw)) throw new Error("unsafe");
  return raw;
}

export function safeEmail(value: unknown) {
  const email = plainText(value, { max: 254, optional: true }).toLowerCase();
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("invalid-contact");
  return email;
}

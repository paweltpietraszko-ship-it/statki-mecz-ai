/** Błąd zasad gry: nieprawidłowa akcja. Stan gry pozostaje bez zmian. */
export class RuleError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'RuleError';
    this.code = code;
  }
}

export function fail(code, detail) {
  throw new RuleError(code, detail);
}

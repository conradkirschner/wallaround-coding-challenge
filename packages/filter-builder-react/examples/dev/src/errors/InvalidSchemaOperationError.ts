// A dedicated error type so callers can distinguish “bad schema/op” from other bugs.
export class InvalidSchemaOperationError extends Error {
  public readonly operator: string;

  constructor(operator: string, message?: string) {
    super(message ?? `Unknown or unsupported operator '${operator}'`);
    this.name = 'InvalidSchemaOperationError';
    this.operator = operator;

    // Ensure instanceof works across transpilation targets
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

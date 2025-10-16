export class InvalidSchemaOperationError extends Error {
  public readonly operator: string;

  constructor(operator: string, message?: string) {
    super(message ?? `Unknown or unsupported operator '${operator}'`);
    this.name = 'InvalidSchemaOperationError';
    this.operator = operator;
  }
}

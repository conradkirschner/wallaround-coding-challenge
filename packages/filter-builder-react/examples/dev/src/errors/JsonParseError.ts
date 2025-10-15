export class JsonParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonParseError';
  }
}

export class HttpRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

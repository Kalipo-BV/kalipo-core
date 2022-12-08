export class KalipoAccountNotFoundError extends Error {
  statusCode = 404;

  constructor() {
    super("No Kalipo account found");
    Object.setPrototypeOf(this, KalipoAccountNotFoundError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

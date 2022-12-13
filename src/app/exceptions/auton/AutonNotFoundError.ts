export class AutonNotFoundError extends Error {
  statusCode = 404;

  constructor() {
    super("No auton found");
    Object.setPrototypeOf(this, AutonNotFoundError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

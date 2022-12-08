export class DuplicateUsernameError extends Error {
  statusCode = 403;

  constructor() {
    super("New username is the same as old username");
    Object.setPrototypeOf(this, DuplicateUsernameError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

export class UsernameAlreadyTakenError extends Error {
  statusCode = 403;

  constructor() {
    super("This username is already taken");
    Object.setPrototypeOf(this, UsernameAlreadyTakenError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

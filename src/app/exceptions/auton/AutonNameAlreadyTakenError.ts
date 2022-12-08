export class AutonNameAlreadyTakenError extends Error {
  statusCode = 403;

  constructor() {
    super("This auton name is already taken");
    Object.setPrototypeOf(this, AutonNameAlreadyTakenError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

export class UsernameContainsSpacesError extends Error {
  statusCode = 403;

  constructor() {
    super("A username cannot contain spaces");
    Object.setPrototypeOf(this, UsernameContainsSpacesError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

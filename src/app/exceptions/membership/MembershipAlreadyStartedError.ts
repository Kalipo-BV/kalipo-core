export class MembershipAlreadyStartedError extends Error {
  statusCode = 403;

  constructor() {
    super("This membership already started");
    Object.setPrototypeOf(this, MembershipAlreadyStartedError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

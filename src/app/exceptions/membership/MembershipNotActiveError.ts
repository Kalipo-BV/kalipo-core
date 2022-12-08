export class MembershipNotActiveError extends Error {
  statusCode = 404;

  constructor() {
    super("You need a membership to vote on this proposal");
    Object.setPrototypeOf(this, MembershipNotActiveError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

export class MembershipInvitationStillOpenError extends Error {
  statusCode = 403;

  constructor() {
    super("You aren't member yet, you still need to accept the invitation");
    Object.setPrototypeOf(this, MembershipInvitationStillOpenError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

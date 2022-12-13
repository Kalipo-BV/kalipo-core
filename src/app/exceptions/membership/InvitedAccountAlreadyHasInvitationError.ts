export class InvitedAccountAlreadyHasInvitationError extends Error {
  statusCode = 400;

  constructor() {
    super("The account you try to invite has already an open invitation");
    Object.setPrototypeOf(this, InvitedAccountAlreadyHasInvitationError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

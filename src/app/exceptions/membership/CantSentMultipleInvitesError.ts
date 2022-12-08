export class CantSentMultipleInvitesError extends Error {
  statusCode = 403;

  constructor() {
    super("Cannot send multiple invites to the same account");
    Object.setPrototypeOf(this, CantSentMultipleInvitesError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

export class InvitedAccountNotFoundError extends Error {
  statusCode = 404;

  constructor() {
    super("The account you try to invite does not exist");
    Object.setPrototypeOf(this, InvitedAccountNotFoundError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

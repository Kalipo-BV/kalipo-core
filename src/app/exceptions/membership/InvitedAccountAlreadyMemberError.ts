export class InvitedAccountAlreadyMemberError extends Error {
  statusCode = 403;

  constructor() {
    super("The account you try to invite is already member");
    Object.setPrototypeOf(this, InvitedAccountAlreadyMemberError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

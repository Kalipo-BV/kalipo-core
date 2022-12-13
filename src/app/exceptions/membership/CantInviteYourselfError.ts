export class CantInviteYourselfError extends Error {
  statusCode = 403;

  constructor() {
    super("You cannot invite yourself");
    Object.setPrototypeOf(this, CantInviteYourselfError.prototype);
  }

  getErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

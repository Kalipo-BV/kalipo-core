export class InvitationAlreadyAcceptedError extends Error {
    statusCode = 403;

    constructor() {
        super("This invitation is already accepted");
        Object.setPrototypeOf(this, InvitationAlreadyAcceptedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
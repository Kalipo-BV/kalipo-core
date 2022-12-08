export class InvitationAlreadyRefusedError extends Error {
    statusCode = 403;

    constructor() {
        super("This invitation is already refused");
        Object.setPrototypeOf(this, InvitationAlreadyRefusedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
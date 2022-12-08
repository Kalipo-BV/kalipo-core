export class MembershipInvitationNotFoundError extends Error {
    statusCode = 404;

    constructor() {
        super("Could not find membership invitation");
        Object.setPrototypeOf(this, MembershipInvitationNotFoundError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

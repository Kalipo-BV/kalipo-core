export class MembershipNotBoundToKalipoAccountError extends Error {
    statusCode = 404;

    constructor() {
        super("This membership is not bound to this kalipo-account");
        Object.setPrototypeOf(this, MembershipNotBoundToKalipoAccountError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

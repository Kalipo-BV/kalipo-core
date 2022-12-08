export class KalipoAccountNotBoundToMembershipError extends Error {
    statusCode = 404;

    constructor() {
        super("This kalipo-account is not bound to this membership");
        Object.setPrototypeOf(this, KalipoAccountNotBoundToMembershipError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

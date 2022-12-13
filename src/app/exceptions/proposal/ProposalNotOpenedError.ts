export class ProposalNotOpenedError extends Error {
    statusCode = 403;

    constructor() {
        super("The proposal has not been opened yet for voting");
        Object.setPrototypeOf(this, ProposalNotOpenedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

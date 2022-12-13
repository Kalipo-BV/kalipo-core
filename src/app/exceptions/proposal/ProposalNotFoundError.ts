export class ProposalNotFoundError extends Error {
    statusCode = 404;

    constructor() {
        super("The proposal cannot be found");
        Object.setPrototypeOf(this, ProposalNotFoundError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

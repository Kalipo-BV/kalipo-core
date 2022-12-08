export class ProposalClosedError extends Error {
    statusCode = 403;

    constructor() {
        super("The proposal is closed and therefore does not accept new votes");
        Object.setPrototypeOf(this, ProposalClosedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

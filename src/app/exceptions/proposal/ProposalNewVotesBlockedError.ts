export class ProposalNewVotesBlockedError extends Error {
    statusCode = 403;

    constructor() {
        super("The proposal is closed and therefore does not accept new votes");
        Object.setPrototypeOf(this, ProposalNewVotesBlockedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}

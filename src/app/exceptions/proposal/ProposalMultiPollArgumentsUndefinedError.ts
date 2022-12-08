export class ProposalMultiPollArgumentsUndefinedError extends Error {
    statusCode = 400;

    constructor() {
        super("Proposal multiChoicePollArguments.answers is undefined");
        Object.setPrototypeOf(this, ProposalMultiPollArgumentsUndefinedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
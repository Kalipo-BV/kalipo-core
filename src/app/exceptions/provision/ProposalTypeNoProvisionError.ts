export class ProposalTypeNoProvisionError extends Error {
    statusCode = 409

    constructor() {
        super("This type has been constitutionalised but is not yet provisioned. Submit a bill to create the first provisions.");
        Object.setPrototypeOf(this, ProposalTypeNoProvisionError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
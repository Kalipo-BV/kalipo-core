export class ProposalQuestionnaireArgumentsUndefinedError extends Error {
    statusCode = 400;

    constructor() {
        super("Proposal ProposalQuestionnaireArguments is undefined");
        Object.setPrototypeOf(this, ProposalQuestionnaireArgumentsUndefinedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
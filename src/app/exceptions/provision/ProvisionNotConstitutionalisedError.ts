export class ProvisionNotConstitutionalisedError extends Error {
    statusCode = 404;

    constructor() {
        super("This provision has not been constitutionalised");
        Object.setPrototypeOf(this, ProvisionNotConstitutionalisedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
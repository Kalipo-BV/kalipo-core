export class ProvisionNotFoundError extends Error {
    statusCode = 404;

    constructor() {
        super("Provision not found");
        Object.setPrototypeOf(this, ProvisionNotFoundError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
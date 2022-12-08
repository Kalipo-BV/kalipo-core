export class AlreadyVotedError extends Error {
    statusCode = 400;

    constructor(message?: string) {
        super("You already voted: " + message);
        Object.setPrototypeOf(this, AlreadyVotedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
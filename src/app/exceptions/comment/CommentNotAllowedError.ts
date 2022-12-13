export class CommentNotAllowedError extends Error {
    statusCode = 404;

    constructor() {
        super("New comments are only allowed when the proposal is in the campaining phase");
        Object.setPrototypeOf(this, CommentNotAllowedError.prototype);
    }

    getErrorMessage() {
        return 'Something went wrong: ' + this.message;
    }
}
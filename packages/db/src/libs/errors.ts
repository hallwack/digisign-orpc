class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends BaseError {}
export class UnauthorizedError extends BaseError {}
export class ValidationError extends BaseError {}
export class DrizzleError extends BaseError {}
export class InternalError extends BaseError {}
export class InternalServerError extends BaseError {}

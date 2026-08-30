import { convertStatusCode, type HTTPstatusCode } from "#/lib/router/http/httpStatus";

export default class UserError extends Error {
  status: number;

  constructor(status: HTTPstatusCode, message: string) {
    super(message);
    this.status = convertStatusCode(status);
    this.name = "UserError";
  }
}

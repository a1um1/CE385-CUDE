const HTTPstatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export class HTTPstatus {
  currentStatus: number;

  constructor(status = 200) {
    this.currentStatus = status;
  }

  set(status: keyof typeof HTTPstatusCode | number) {
    if (typeof status === "number") return (this.currentStatus = status);
    return (this.currentStatus = HTTPstatusCode[status] || 500);
  }

  get value() {
    return this.currentStatus;
  }
}

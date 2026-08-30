export const HTTPstatusCode = {
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

export type HTTPstatusCode = keyof typeof HTTPstatusCode | number;

export const convertStatusCode = (status: HTTPstatusCode): number => {
  if (typeof status === "number") return status;
  return HTTPstatusCode[status] || 500;
};

export class HTTPstatus {
  currentStatus: number;

  constructor(status = 200) {
    this.currentStatus = status;
  }

  set(status: HTTPstatusCode) {
    return (this.currentStatus = convertStatusCode(status));
  }

  get value() {
    return this.currentStatus;
  }
}

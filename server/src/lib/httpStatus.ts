export class HTTPstatus {
  currentStatus: number;

  constructor(status = 200) {
    this.currentStatus = status;
  }

  set(status: number) {
    this.currentStatus = status;
  }

  get value() {
    return this.currentStatus;
  }
}

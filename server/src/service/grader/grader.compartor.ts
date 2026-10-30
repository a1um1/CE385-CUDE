export default class GraderComparator {
  // oxlint-disable-next-line no-useless-constructor
  constructor(_type: string) {}

  static compareResult(expected: string, actual: string) {
    return expected.trim() === actual.trim();
  }
}

export default class GraderComparator {
  static compareResult(expected: string, actual: string) {
    return expected.trim() === actual.trim();
  }
}

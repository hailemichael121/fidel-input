/**
 * Smart Phonetic Correction Engine for Non-Standard Spelling Variants
 */

export class SmartCorrector {
  /**
   * Generates candidate normalized phonetic spellings for non-standard inputs.
   * e.g., "selamm" -> "selam", "yihunn" -> "yihun", "bettt" -> "bet"
   */
  public normalizeInput(input: string): string[] {
    if (!input || input.length < 3) {
      return [input];
    }

    const candidates: string[] = [input];

    // Collapse trailing repeated identical characters (e.g. "selamm" -> "selam")
    const collapsedTrailing = input.replace(/(.)\1+$/, "$1");
    if (collapsedTrailing !== input) {
      candidates.push(collapsedTrailing);
    }

    // Collapse internal repeated identical consonants (e.g. "beett" -> "bet")
    const collapsedAll = input.replace(/(.)\1+/g, "$1");
    if (collapsedAll !== input && !candidates.includes(collapsedAll)) {
      candidates.push(collapsedAll);
    }

    return candidates;
  }
}

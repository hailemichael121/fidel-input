/**
 * Smart Phonetic Correction Engine for Non-Standard Spelling Variants
 */

export class SmartCorrector {
  /**
   * Generates candidate normalized phonetic spellings for non-standard inputs.
   * e.g., "selamm" -> "selam", "yihunn" -> "yihun", "beett" -> "bet", "amhariph" -> "amharif"
   */
  public normalizeInput(input: string): string[] {
    if (!input || input.length < 3) {
      return [input];
    }

    const candidates: string[] = [input];

    // 1. Collapse trailing repeated identical characters (e.g. "selamm" -> "selam")
    const collapsedTrailing = input.replace(/(.)\1+$/, "$1");
    if (collapsedTrailing !== input) {
      candidates.push(collapsedTrailing);
    }

    // 2. Collapse internal repeated identical characters (e.g. "beett" -> "bet")
    const collapsedAll = input.replace(/(.)\1+/g, "$1");
    if (collapsedAll !== input && !candidates.includes(collapsedAll)) {
      candidates.push(collapsedAll);
    }

    // 3. Phonetic digraph substitutions (e.g., "ph" -> "f", "ck" -> "k")
    if (input.includes("ph")) {
      const phSubbed = input.replace(/ph/g, "f");
      if (!candidates.includes(phSubbed)) {
        candidates.push(phSubbed);
      }
    }

    if (input.includes("ck")) {
      const ckSubbed = input.replace(/ck/g, "k");
      if (!candidates.includes(ckSubbed)) {
        candidates.push(ckSubbed);
      }
    }

    return candidates;
  }

  /**
   * Attempts to correct a non-standard input word using candidate normalizations
   * and a provided lookup function.
   */
  public correctWord(input: string, lookupFn: (candidate: string) => string | null): string | null {
    const candidates = this.normalizeInput(input);
    for (const cand of candidates) {
      const match = lookupFn(cand);
      if (match) {
        return match;
      }
    }
    return null;
  }
}

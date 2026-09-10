/**
 * Personal Dictionary Manager for User Custom Transliteration Mappings
 */

export class PersonalDictionary {
  private entries: Map<string, string> = new Map();

  constructor(initialEntries?: Record<string, string>) {
    if (initialEntries) {
      this.setEntries(initialEntries);
    }
  }

  public addEntry(latin: string, ethiopic: string): void {
    if (!latin || !ethiopic) {
      return;
    }
    const key = latin.trim().toLowerCase();
    this.entries.set(key, ethiopic.trim());
  }

  public removeEntry(latin: string): boolean {
    const key = latin.trim().toLowerCase();
    return this.entries.delete(key);
  }

  public get(latin: string): string | null {
    const key = latin.trim().toLowerCase();
    return this.entries.get(key) ?? null;
  }

  public has(latin: string): boolean {
    const key = latin.trim().toLowerCase();
    return this.entries.has(key);
  }

  public setEntries(records: Record<string, string>): void {
    this.entries.clear();
    for (const [key, val] of Object.entries(records)) {
      if (key && val) {
        this.entries.set(key.trim().toLowerCase(), val.trim());
      }
    }
  }

  public getEntries(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, val] of this.entries.entries()) {
      result[key] = val;
    }
    return result;
  }

  public clear(): void {
    this.entries.clear();
  }
}

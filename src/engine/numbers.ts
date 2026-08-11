/**
 * Ethiopic Numeral Conversion System
 */

export const ETHIOPIC_DIGITS: Record<string, string> = {
  "1": "፩",
  "2": "፪",
  "3": "፫",
  "4": "፬",
  "5": "፭",
  "6": "፮",
  "7": "፯",
  "8": "፰",
  "9": "፱",
};

export const ETHIOPIC_TENS: Record<string, string> = {
  "10": "፲",
  "20": "፳",
  "30": "፴",
  "40": "፵",
  "50": "፶",
  "60": "፷",
  "70": "፸",
  "80": "፹",
  "90": "፺",
};

export const HUNDRED = "፻"; // 100
export const TEN_THOUSAND = "፼"; // 10,000

/**
 * Converts a positive integer string into standard Ethiopic numerals.
 */
export function convertNumberToEthiopic(numStr: string): string {
  // Strip non-digit characters
  const sanitized = numStr.replace(/^0+/, "");
  if (!sanitized) {
    return numStr === "0" ? "0" : numStr;
  }

  const num = parseInt(sanitized, 10);
  if (isNaN(num) || num <= 0) {
    return numStr;
  }

  if (num < 10) {
    return ETHIOPIC_DIGITS[sanitized] || numStr;
  }

  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    let res = "";
    if (tens > 0 && ETHIOPIC_TENS[tens.toString()]) {
      res += ETHIOPIC_TENS[tens.toString()];
    }
    if (ones > 0 && ETHIOPIC_DIGITS[ones.toString()]) {
      res += ETHIOPIC_DIGITS[ones.toString()];
    }
    return res;
  }

  if (num < 10000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    let res = "";
    if (hundreds > 0) {
      const hundredPrefix = convertNumberToEthiopic(hundreds.toString());
      // In Ethiopic, 100 is written as ፻ (not ፩፻)
      if (hundredPrefix === "፩") {
        res += HUNDRED;
      } else {
        res += hundredPrefix + HUNDRED;
      }
    }
    if (remainder > 0) {
      res += convertNumberToEthiopic(remainder.toString());
    }
    return res;
  }

  // Numbers 10,000 and higher using ፼ (myriad)
  const myriads = Math.floor(num / 10000);
  const remainder = num % 10000;
  let res = "";
  if (myriads > 0) {
    const myriadPrefix = convertNumberToEthiopic(myriads.toString());
    if (myriadPrefix === "፩") {
      res += TEN_THOUSAND;
    } else {
      res += myriadPrefix + TEN_THOUSAND;
    }
  }
  if (remainder > 0) {
    res += convertNumberToEthiopic(remainder.toString());
  }
  return res;
}

/**
 * Replaces standalone Arabic digits in a text stream with Ethiopic numerals if enabled.
 */
export function convertNumbersInText(text: string, enabled: boolean): string {
  if (!enabled) {
    return text;
  }

  return text.replace(/\b\d+\b/g, (match) => {
    return convertNumberToEthiopic(match);
  });
}

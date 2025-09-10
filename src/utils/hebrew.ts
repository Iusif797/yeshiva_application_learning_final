export const calculateGematria = (hebrewText: string) => {
  const hebrewLetterValues: { [key: string]: number } = {
    // Regular letters
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    // Final letters
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
  };

  let simple = 0;
  let standard = 0;
  let ordinal = 0;
  let letterIndex = 0;

  for (let i = 0; i < hebrewText.length; i++) {
    const char = hebrewText[i];
    
    // Skip vowels and punctuation
    if (/[\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C5\u05C7\u05C0\u05C3\u05C6]/.test(char)) {
      continue;
    }
    
    const value = hebrewLetterValues[char] || 0;
    
    if (value > 0) {
      simple += value;
      standard += value;
      letterIndex++;
      ordinal += letterIndex;
    }
  }

  return {
    simple,
    standard,
    ordinal
  };
};

export const extractUniqueWords = (text: string): string[] => {
  // Remove Hebrew vowels and punctuation, split by whitespace
  const cleanText = text.replace(/[\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C5\u05C7]/g, '');
  const words = cleanText.split(/\s+/).filter(word => 
    word.length > 0 && /[\u0590-\u05FF]/.test(word)
  );
  
  return [...new Set(words)];
};

export const isRTL = (text: string): boolean => {
  return /[\u0590-\u05FF\u0600-\u06FF]/.test(text);
};
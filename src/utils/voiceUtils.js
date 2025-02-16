export const speak = (text) => {
  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
};

export const parseDate = (text) => {
  const today = new Date();
  text = text.toLowerCase();

  // Handle "tomorrow"
  if (text.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Handle "next/coming sunday/monday/etc"
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const day of days) {
    if (text.includes(day)) {
      const targetDay = days.indexOf(day);
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0 || text.includes('next') || text.includes('coming')) {
        daysToAdd += 7;
      }
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysToAdd);
      return futureDate.toISOString().split('T')[0];
    }
  }

  // Handle "17th of feb" or "february 17th" format
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                 'july', 'august', 'september', 'october', 'november', 'december'];
  const datePattern = /(\d{1,2})(st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)/i;
  const altPattern = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?/i;
  
  let match = text.match(datePattern) || text.match(altPattern);
  if (match) {
    const month = months.indexOf(match[1].toLowerCase());
    const day = parseInt(match[2]);
    const year = today.getFullYear();
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  }

  return null;
};

export const parseTimeSlot = (text, availableSlots) => {
  text = text.toLowerCase();
  
  // Convert spoken time to 24-hour format
  const timeMap = {
    'nine': '09', '9': '09',
    'ten': '10',
    'eleven': '11', '11': '11',
    'twelve': '12',
    'two': '14', '2': '14',
    'four': '16', '4': '16',
    'six': '18', '6': '18'
  };

  // Replace spoken numbers with digits
  Object.entries(timeMap).forEach(([word, digit]) => {
    text = text.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  // Match patterns like "9 am", "2 pm", "14:00", etc.
  const patterns = [
    /(\d{1,2})(?:\s*)?(?::|00)?\s*(?:am|pm)?/i,
    /morning/i,
    /afternoon/i,
    /evening/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[0].includes('morning')) {
        return availableSlots.find(slot => slot.includes('09:00 AM'));
      }
      if (match[0].includes('afternoon')) {
        return availableSlots.find(slot => slot.includes('02:00 PM'));
      }
      if (match[0].includes('evening')) {
        return availableSlots.find(slot => slot.includes('04:00 PM'));
      }

      const hour = match[1] ? parseInt(match[1]) : null;
      if (hour) {
        // Convert to 24-hour format if PM
        const hour24 = text.includes('pm') && hour < 12 ? hour + 12 : hour;
        const timeStr = `${hour24.toString().padStart(2, '0')}:00`;
        return availableSlots.find(slot => slot.startsWith(timeStr));
      }
    }
  }

  return null;
};

export const findBestMatch = (text, options, searchTerms = 'searchTerms') => {
  text = text.toLowerCase().trim();
  let bestMatch = null;
  let highestScore = 0;

  // Helper function to calculate similarity score
  const calculateScore = (term, input) => {
    term = term.toLowerCase().trim();
    // Exact match gets highest score
    if (term === input) return 1;
    // Contains whole word match gets high score
    if (term.includes(` ${input} `) || term.startsWith(`${input} `) || term.endsWith(` ${input}`)) return 0.8;
    // Partial match gets proportional score
    if (term.includes(input) || input.includes(term)) {
      return Math.min(term.length, input.length) / Math.max(term.length, input.length);
    }
    return 0;
  };

  for (const option of options) {
    const terms = option[searchTerms] || [option.label.toLowerCase()];
    
    for (const term of terms) {
      const score = calculateScore(term, text);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = option;
      }
    }
  }

  return highestScore > 0.3 ? bestMatch : null;
};

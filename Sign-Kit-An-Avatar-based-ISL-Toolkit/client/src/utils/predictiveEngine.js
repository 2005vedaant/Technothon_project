// predictiveEngine.js - Lightweight local predictive word engine for SignBridge AI

/**
 * Context-aware next word prediction map for common conversational & ISL phrases.
 * Key: normalized last 1, 2, or 3 words (lowercase)
 * Value: array of candidate next words in order of priority.
 */
const CONTEXT_MAP = {
  // 1-gram triggers
  "i": ["want", "need", "am", "can", "like", "go", "have", "would"],
  "you": ["are", "want", "need", "can", "have", "like", "welcome"],
  "we": ["want", "need", "are", "can", "go", "have", "like"],
  "he": ["is", "wants", "needs", "can", "likes", "went"],
  "she": ["is", "wants", "needs", "can", "likes", "went"],
  "it": ["is", "was", "looks", "tastes", "costs"],
  "want": ["to", "you", "some", "more", "water", "food", "bill"],
  "need": ["to", "help", "water", "food", "doctor", "more"],
  "like": ["to", "this", "that", "more", "food", "water"],
  "would": ["like", "you", "want", "be", "have"],
  "can": ["i", "you", "we", "help", "get", "have", "see"],
  "am": ["fine", "ready", "sorry", "hungry", "going", "good"],
  "are": ["you", "we", "ready", "fine", "good"],
  "is": ["good", "bad", "hot", "cold", "ready", "spicy", "fresh", "there"],
  "to": ["go", "eat", "buy", "meet", "order", "drink", "pay", "have", "see"],
  "go": ["home", "there", "to", "outside", "now", "tomorrow"],
  "eat": ["food", "bread", "pizza", "burger", "sandwich", "dessert", "now"],
  "drink": ["water", "milk", "coke", "soda", "juice", "tea", "coffee"],
  "order": ["food", "pizza", "burger", "bill", "water", "more"],
  "buy": ["food", "water", "this", "tickets", "medicine"],
  "pay": ["cash", "bill", "credit card", "money"],
  "help": ["me", "please", "us", "now", "needed"],
  "thank": ["you", "very much", "so much"],
  "thanks": ["a lot", "for help", "so much"],
  "please": ["help", "give", "bring", "wait", "call"],
  "good": ["morning", "afternoon", "evening", "night", "food", "job"],
  "bad": ["taste", "quality", "service", "weather"],
  "hot": ["water", "food", "coffee", "tea", "weather"],
  "cold": ["water", "drink", "weather", "food"],
  "more": ["water", "food", "time", "please", "help"],
  "where": ["is", "are", "can", "to"],
  "what": ["is", "would", "do", "you", "time"],
  "how": ["much", "are", "can", "is", "many"],
  "no": ["thank-you", "problem", "need", "more", "sugar"],
  "yes": ["please", "i do", "sure", "correct"],
  "sorry": ["for", "about", "i am", "late"],
  "hello": ["how", "there", "friend", "sir"],
  "bye": ["see you", "goodbye", "now"],

  // ISL food & dining vocabulary
  "bread": ["and", "with", "butter", "please"],
  "water": ["please", "bottle", "cold", "glass"],
  "bill": ["please", "total", "pay"],
  "menu": ["please", "card", "items"],
  "credit": ["card", "payment"],

  // 2-gram phrase triggers
  "i want": ["to", "you", "some", "more", "water", "food"],
  "i need": ["to", "help", "water", "food", "doctor", "more"],
  "i am": ["fine", "ready", "sorry", "hungry", "going"],
  "i like": ["to", "this", "food", "water", "more"],
  "i would": ["like", "have", "want", "prefer"],
  "want to": ["go", "eat", "buy", "meet", "order", "drink", "pay"],
  "need to": ["go", "eat", "buy", "meet", "see", "pay"],
  "would like": ["to", "some", "a", "water", "food", "bill"],
  "like to": ["go", "eat", "buy", "drink", "order"],
  "can i": ["have", "get", "go", "help", "see", "pay"],
  "can you": ["help", "bring", "give", "show", "tell"],
  "want to go": ["home", "there", "outside", "to", "tomorrow", "now"],
  "want to eat": ["food", "pizza", "burger", "bread", "sandwich"],
  "want to drink": ["water", "milk", "coke", "soda", "juice"],
  "want to buy": ["food", "water", "this", "tickets"],
  "need help": ["please", "with", "now", "urgent"],
  "thank you": ["so much", "very much", "for", "again"],
  "where is": ["the", "my", "toilet", "hospital", "manager"],
  "what is": ["the", "this", "your", "that"],
  "how much": ["is", "does", "for", "this"],

  // 3-gram phrase triggers
  "i want to": ["go", "eat", "buy", "meet", "order", "drink"],
  "i need to": ["go", "eat", "buy", "meet", "see", "pay"],
  "i would like": ["to", "some", "a", "water", "food", "bill"],
  "i want to go": ["home", "there", "outside", "tomorrow", "now"],
  "i want to eat": ["food", "pizza", "burger", "bread", "sandwich"],
  "i want to drink": ["water", "milk", "coke", "soda", "juice"],
  "where is the": ["toilet", "bathroom", "hospital", "manager", "menu"],
  "how much is": ["this", "the bill", "total", "that"],
  "can i have": ["water", "the bill", "menu", "food", "more"]
};

// Generic default fallbacks if no context matches
const DEFAULT_FALLBACKS = ["want", "need", "help", "please", "to", "you", "go", "eat"];

/**
 * Predicts up to `maxSuggestions` next words given the current input sentence.
 * @param {string} text - Current sentence / transcript text
 * @param {number} maxSuggestions - Number of suggestions to return (default 4)
 * @returns {Array<string>} Array of unique suggested words
 */
export function getPredictiveSuggestions(text, maxSuggestions = 4) {
  if (!text || typeof text !== 'string') return [];

  const trimmed = text.trim();
  if (!trimmed) return [];

  // Split into normalized words (lowercase, letters/alphanumerics/hyphens)
  const words = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return [];

  const candidates = [];

  // 1. Try matching 3-gram (last 3 words)
  if (words.length >= 3) {
    const triKey = words.slice(-3).join(' ');
    if (CONTEXT_MAP[triKey]) {
      candidates.push(...CONTEXT_MAP[triKey]);
    }
  }

  // 2. Try matching 2-gram (last 2 words)
  if (words.length >= 2) {
    const biKey = words.slice(-2).join(' ');
    if (CONTEXT_MAP[biKey]) {
      candidates.push(...CONTEXT_MAP[biKey]);
    }
  }

  // 3. Try matching 1-gram (last 1 word)
  const uniKey = words[words.length - 1];
  if (CONTEXT_MAP[uniKey]) {
    candidates.push(...CONTEXT_MAP[uniKey]);
  }

  // 4. Fill remaining slots with default fallbacks if needed
  candidates.push(...DEFAULT_FALLBACKS);

  // Deduplicate candidates and ensure candidate is not identical to the last word
  const lastWord = words[words.length - 1];
  const uniqueSuggestions = [];

  for (const item of candidates) {
    const cleanItem = item.trim().toLowerCase();
    // Skip if candidate is identical to the last word (avoiding nonsensical repetition like "to to")
    if (cleanItem === lastWord && cleanItem !== 'very') continue;

    if (!uniqueSuggestions.includes(item)) {
      uniqueSuggestions.push(item);
    }
    if (uniqueSuggestions.length >= maxSuggestions) {
      break;
    }
  }

  return uniqueSuggestions.slice(0, maxSuggestions);
}

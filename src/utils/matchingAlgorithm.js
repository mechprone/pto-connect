/**
 * Smart Transaction Matching Algorithm
 * Uses fuzzy string matching, amount comparison, and date proximity
 * to intelligently match bank transactions with system expenses
 */

class MatchingAlgorithm {
  constructor() {
    this.config = {
      // Confidence thresholds
      autoMatchThreshold: 0.85,
      suggestMatchThreshold: 0.6,
      
      // Scoring weights
      weights: {
        amount: 0.4,        // 40% - Amount similarity
        description: 0.3,   // 30% - Description similarity
        date: 0.2,          // 20% - Date proximity
        vendor: 0.1         // 10% - Vendor matching
      },
      
      // Matching tolerances
      amountTolerance: 0.01,  // $0.01 tolerance for exact matches
      dateWindow: 7,          // 7 days window for date matching
      
      // Fuzzy matching parameters
      fuzzyThreshold: 0.6     // Minimum similarity for fuzzy matches
    };
  }

  /**
   * Find matches for all bank transactions against system expenses
   */
  findMatches(bankTransactions, systemExpenses) {
    const matches = [];

    for (const bankTx of bankTransactions) {
      const suggestions = this.findSuggestionsForTransaction(bankTx, systemExpenses);
      
      matches.push({
        bankTransaction: bankTx,
        suggestions: suggestions,
        bestMatch: suggestions.length > 0 ? suggestions[0] : null,
        autoMatch: suggestions.length > 0 && suggestions[0].confidence >= this.config.autoMatchThreshold,
        isMatched: false
      });
    }

    return matches;
  }

  /**
   * Find potential matches for a single bank transaction
   */
  findSuggestionsForTransaction(bankTransaction, systemExpenses) {
    const suggestions = [];

    for (const expense of systemExpenses) {
      const score = this.calculateMatchScore(bankTransaction, expense);
      
      if (score.totalScore >= this.config.suggestMatchThreshold) {
        suggestions.push({
          expense: expense,
          confidence: score.totalScore,
          matchReasons: score.reasons,
          scoreBreakdown: score.breakdown
        });
      }
    }

    // Sort by confidence (highest first)
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate comprehensive match score between bank transaction and expense
   */
  calculateMatchScore(bankTransaction, expense) {
    const scores = {
      amount: this.calculateAmountScore(bankTransaction.amount, expense.amount),
      description: this.calculateDescriptionScore(bankTransaction.description, expense.description || expense.vendor),
      date: this.calculateDateScore(bankTransaction.date, expense.expense_date || expense.date),
      vendor: this.calculateVendorScore(bankTransaction.description, expense.vendor)
    };

    // Calculate weighted total score
    const totalScore = Object.keys(scores).reduce((total, key) => {
      return total + (scores[key] * this.config.weights[key]);
    }, 0);

    // Generate match reasons
    const reasons = this.generateMatchReasons(scores, bankTransaction, expense);

    return {
      totalScore: Math.min(totalScore, 1.0),
      breakdown: scores,
      reasons: reasons
    };
  }

  /**
   * Calculate amount similarity score
   */
  calculateAmountScore(bankAmount, expenseAmount) {
    const difference = Math.abs(bankAmount - expenseAmount);
    
    // Exact match (within tolerance)
    if (difference <= this.config.amountTolerance) {
      return 1.0;
    }
    
    // Calculate percentage difference
    const percentDiff = difference / Math.max(bankAmount, expenseAmount);
    
    // Score decreases as percentage difference increases
    if (percentDiff <= 0.01) return 0.95;  // 1% difference
    if (percentDiff <= 0.05) return 0.85;  // 5% difference
    if (percentDiff <= 0.10) return 0.70;  // 10% difference
    if (percentDiff <= 0.20) return 0.50;  // 20% difference
    
    return 0.0; // Too different
  }

  /**
   * Calculate description similarity using fuzzy string matching
   */
  calculateDescriptionScore(bankDescription, expenseDescription) {
    if (!bankDescription || !expenseDescription) return 0.0;

    // Normalize descriptions
    const bankDesc = this.normalizeDescription(bankDescription);
    const expenseDesc = this.normalizeDescription(expenseDescription);

    // Calculate Levenshtein distance-based similarity
    const similarity = this.calculateStringSimilarity(bankDesc, expenseDesc);
    
    // Boost score for exact word matches
    const wordMatchBoost = this.calculateWordMatchBoost(bankDesc, expenseDesc);
    
    return Math.min(similarity + wordMatchBoost, 1.0);
  }

  /**
   * Calculate date proximity score
   */
  calculateDateScore(bankDate, expenseDate) {
    if (!bankDate || !expenseDate) return 0.0;

    const bank = new Date(bankDate);
    const expense = new Date(expenseDate);
    const daysDiff = Math.abs((bank - expense) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 1.0;           // Same day
    if (daysDiff <= 1) return 0.9;           // 1 day difference
    if (daysDiff <= 3) return 0.8;           // 3 days difference
    if (daysDiff <= 7) return 0.6;           // Within a week
    if (daysDiff <= 14) return 0.4;          // Within 2 weeks
    if (daysDiff <= 30) return 0.2;          // Within a month
    
    return 0.0; // Too far apart
  }

  /**
   * Calculate vendor-specific matching score
   */
  calculateVendorScore(bankDescription, vendor) {
    if (!vendor) return 0.0;

    const bankDesc = this.normalizeDescription(bankDescription);
    const vendorName = this.normalizeDescription(vendor);

    // Check if vendor name appears in bank description
    if (bankDesc.includes(vendorName)) return 1.0;
    
    // Check for partial matches
    const vendorWords = vendorName.split(' ').filter(word => word.length > 2);
    const matchedWords = vendorWords.filter(word => bankDesc.includes(word));
    
    return matchedWords.length / vendorWords.length;
  }

  /**
   * Normalize description for better matching
   */
  normalizeDescription(description) {
    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')           // Remove special characters
      .replace(/\b(pos|atm|ach|chk|dep|wd|tfr|fee)\b/g, '') // Remove bank codes
      .replace(/\b\d+\b/g, '')            // Remove numbers
      .replace(/\s+/g, ' ')               // Normalize whitespace
      .trim();
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    
    return maxLength === 0 ? 1.0 : 1 - (distance / maxLength);
  }

  /**
   * Calculate boost for exact word matches
   */
  calculateWordMatchBoost(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 2);
    const words2 = str2.split(' ').filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0.0;

    const matchedWords = words1.filter(word => words2.includes(word));
    const matchRatio = matchedWords.length / Math.max(words1.length, words2.length);
    
    return matchRatio * 0.2; // Up to 20% boost
  }

  /**
   * Generate human-readable match reasons
   */
  generateMatchReasons(scores, bankTransaction, expense) {
    const reasons = [];

    if (scores.amount >= 0.95) {
      reasons.push('Exact amount match');
    } else if (scores.amount >= 0.8) {
      reasons.push('Very close amount');
    } else if (scores.amount >= 0.6) {
      reasons.push('Similar amount');
    }

    if (scores.description >= 0.8) {
      reasons.push('Strong description match');
    } else if (scores.description >= 0.6) {
      reasons.push('Similar description');
    }

    if (scores.date >= 0.9) {
      reasons.push('Same/next day');
    } else if (scores.date >= 0.6) {
      reasons.push('Within a week');
    }

    if (scores.vendor >= 0.8) {
      reasons.push('Vendor name match');
    }

    if (reasons.length === 0) {
      reasons.push('Potential match');
    }

    return reasons;
  }

  /**
   * Perform automatic matching for high-confidence matches
   */
  performAutoMatching(matches) {
    const autoMatches = [];

    for (const match of matches) {
      if (match.autoMatch && match.bestMatch) {
        // Mark as auto-matched
        match.isMatched = true;
        match.matchedExpense = match.bestMatch.expense;
        autoMatches.push(match);
      }
    }

    return autoMatches;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get matching statistics
   */
  getMatchingStats(matches) {
    return {
      total: matches.length,
      withSuggestions: matches.filter(m => m.suggestions.length > 0).length,
      autoMatched: matches.filter(m => m.autoMatch).length,
      highConfidence: matches.filter(m => m.bestMatch && m.bestMatch.confidence >= 0.8).length,
      mediumConfidence: matches.filter(m => m.bestMatch && m.bestMatch.confidence >= 0.6 && m.bestMatch.confidence < 0.8).length,
      lowConfidence: matches.filter(m => m.bestMatch && m.bestMatch.confidence < 0.6).length,
      noMatches: matches.filter(m => m.suggestions.length === 0).length
    };
  }
}

// Export singleton instance
export const matchingAlgorithm = new MatchingAlgorithm();

// Export class for testing
export { MatchingAlgorithm };

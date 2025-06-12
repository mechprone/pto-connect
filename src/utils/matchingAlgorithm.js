// Smart Transaction Matching Algorithm for Bank Statement Reconciliation

class MatchingAlgorithm {
  constructor() {
    this.matchingThreshold = 0.7; // Minimum confidence score for auto-matching
    this.amountTolerance = 0.01; // $0.01 tolerance for amount matching
  }

  /**
   * Find potential matches between bank transactions and system expenses
   * @param {Array} bankTransactions - Transactions from OCR
   * @param {Array} systemExpenses - Expenses from the system
   * @returns {Array} Array of match suggestions with confidence scores
   */
  findMatches(bankTransactions, systemExpenses) {
    const matches = [];

    for (const bankTx of bankTransactions) {
      const potentialMatches = this.findPotentialMatches(bankTx, systemExpenses);
      
      if (potentialMatches.length > 0) {
        // Sort by confidence score (highest first)
        potentialMatches.sort((a, b) => b.confidence - a.confidence);
        
        matches.push({
          bankTransaction: bankTx,
          suggestions: potentialMatches,
          bestMatch: potentialMatches[0],
          autoMatch: potentialMatches[0].confidence >= this.matchingThreshold
        });
      } else {
        matches.push({
          bankTransaction: bankTx,
          suggestions: [],
          bestMatch: null,
          autoMatch: false
        });
      }
    }

    return matches;
  }

  /**
   * Find potential matches for a single bank transaction
   * @param {Object} bankTransaction - Single bank transaction
   * @param {Array} systemExpenses - Array of system expenses
   * @returns {Array} Array of potential matches with confidence scores
   */
  findPotentialMatches(bankTransaction, systemExpenses) {
    const matches = [];

    for (const expense of systemExpenses) {
      if (expense.is_matched) continue; // Skip already matched expenses

      const confidence = this.calculateMatchConfidence(bankTransaction, expense);
      
      if (confidence > 0.3) { // Only include matches with reasonable confidence
        matches.push({
          expense: expense,
          confidence: confidence,
          matchReasons: this.getMatchReasons(bankTransaction, expense, confidence)
        });
      }
    }

    return matches;
  }

  /**
   * Calculate confidence score for a potential match
   * @param {Object} bankTx - Bank transaction
   * @param {Object} expense - System expense
   * @returns {number} Confidence score between 0 and 1
   */
  calculateMatchConfidence(bankTx, expense) {
    let confidence = 0;
    const weights = {
      amount: 0.4,      // Amount matching is most important
      description: 0.3, // Description similarity
      date: 0.2,        // Date proximity
      vendor: 0.1       // Vendor matching
    };

    // Amount matching
    const amountScore = this.calculateAmountScore(bankTx.amount, expense.amount);
    confidence += amountScore * weights.amount;

    // Description similarity
    const descriptionScore = this.calculateDescriptionScore(bankTx.description, expense.description || expense.vendor);
    confidence += descriptionScore * weights.description;

    // Date proximity (within 7 days)
    const dateScore = this.calculateDateScore(bankTx.date, expense.date);
    confidence += dateScore * weights.date;

    // Vendor matching (if available)
    if (expense.vendor) {
      const vendorScore = this.calculateDescriptionScore(bankTx.description, expense.vendor);
      confidence += vendorScore * weights.vendor;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate amount matching score
   * @param {number} bankAmount - Bank transaction amount
   * @param {number} expenseAmount - System expense amount
   * @returns {number} Score between 0 and 1
   */
  calculateAmountScore(bankAmount, expenseAmount) {
    const difference = Math.abs(bankAmount - expenseAmount);
    
    if (difference <= this.amountTolerance) {
      return 1.0; // Perfect match
    }
    
    // Calculate score based on percentage difference
    const percentageDiff = difference / Math.max(bankAmount, expenseAmount);
    
    if (percentageDiff <= 0.01) return 0.9;  // 1% difference
    if (percentageDiff <= 0.05) return 0.7;  // 5% difference
    if (percentageDiff <= 0.10) return 0.5;  // 10% difference
    if (percentageDiff <= 0.20) return 0.3;  // 20% difference
    
    return 0; // Too different
  }

  /**
   * Calculate description similarity score using fuzzy matching
   * @param {string} desc1 - First description
   * @param {string} desc2 - Second description
   * @returns {number} Score between 0 and 1
   */
  calculateDescriptionScore(desc1, desc2) {
    if (!desc1 || !desc2) return 0;

    // Normalize descriptions
    const normalized1 = this.normalizeDescription(desc1);
    const normalized2 = this.normalizeDescription(desc2);

    // Exact match
    if (normalized1 === normalized2) return 1.0;

    // Check for substring matches
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.8;
    }

    // Fuzzy string matching using Levenshtein distance
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const similarity = 1 - (distance / maxLength);

    // Boost score for common vendor patterns
    const vendorBoost = this.checkVendorPatterns(desc1, desc2);
    
    return Math.min(similarity + vendorBoost, 1.0);
  }

  /**
   * Calculate date proximity score
   * @param {string} bankDate - Bank transaction date
   * @param {string} expenseDate - System expense date
   * @returns {number} Score between 0 and 1
   */
  calculateDateScore(bankDate, expenseDate) {
    const date1 = new Date(bankDate);
    const date2 = new Date(expenseDate);
    
    const daysDifference = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) return 1.0;      // Same day
    if (daysDifference <= 1) return 0.9;       // 1 day difference
    if (daysDifference <= 3) return 0.7;       // 3 days difference
    if (daysDifference <= 7) return 0.5;       // 1 week difference
    if (daysDifference <= 14) return 0.3;      // 2 weeks difference
    
    return 0; // More than 2 weeks
  }

  /**
   * Normalize description for better matching
   * @param {string} description - Raw description
   * @returns {string} Normalized description
   */
  normalizeDescription(description) {
    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\b(pos|atm|ach|chk|dep|wd|tfr|fee|debit|credit)\b/g, '') // Remove bank codes
      .replace(/\b\d+\b/g, '') // Remove numbers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Check for common vendor patterns
   * @param {string} desc1 - First description
   * @param {string} desc2 - Second description
   * @returns {number} Boost score
   */
  checkVendorPatterns(desc1, desc2) {
    const commonVendors = [
      'walmart', 'target', 'amazon', 'costco', 'home depot', 'lowes',
      'starbucks', 'mcdonalds', 'subway', 'pizza', 'gas', 'shell',
      'exxon', 'bp', 'chevron', 'office depot', 'staples'
    ];

    const normalized1 = desc1.toLowerCase();
    const normalized2 = desc2.toLowerCase();

    for (const vendor of commonVendors) {
      if (normalized1.includes(vendor) && normalized2.includes(vendor)) {
        return 0.2; // Boost for common vendor match
      }
    }

    return 0;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get human-readable reasons for a match
   * @param {Object} bankTx - Bank transaction
   * @param {Object} expense - System expense
   * @param {number} confidence - Match confidence
   * @returns {Array} Array of match reasons
   */
  getMatchReasons(bankTx, expense, confidence) {
    const reasons = [];

    // Amount matching
    const amountDiff = Math.abs(bankTx.amount - expense.amount);
    if (amountDiff <= this.amountTolerance) {
      reasons.push('Exact amount match');
    } else if (amountDiff / expense.amount <= 0.05) {
      reasons.push('Very close amount match');
    }

    // Date proximity
    const daysDiff = Math.abs((new Date(bankTx.date) - new Date(expense.date)) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      reasons.push('Same date');
    } else if (daysDiff <= 3) {
      reasons.push(`${Math.round(daysDiff)} day(s) apart`);
    }

    // Description similarity
    const descScore = this.calculateDescriptionScore(bankTx.description, expense.description || expense.vendor);
    if (descScore > 0.8) {
      reasons.push('Strong description match');
    } else if (descScore > 0.5) {
      reasons.push('Partial description match');
    }

    // Vendor matching
    if (expense.vendor && this.calculateDescriptionScore(bankTx.description, expense.vendor) > 0.6) {
      reasons.push('Vendor name match');
    }

    return reasons;
  }

  /**
   * Auto-match transactions with high confidence
   * @param {Array} matches - Array of match suggestions
   * @returns {Array} Array of auto-matched pairs
   */
  performAutoMatching(matches) {
    const autoMatches = [];

    for (const match of matches) {
      if (match.autoMatch && match.bestMatch) {
        autoMatches.push({
          bankTransaction: match.bankTransaction,
          expense: match.bestMatch.expense,
          confidence: match.bestMatch.confidence,
          reasons: match.bestMatch.matchReasons
        });
      }
    }

    return autoMatches;
  }

  /**
   * Update matching parameters
   * @param {Object} params - New parameters
   */
  updateParameters(params) {
    if (params.matchingThreshold !== undefined) {
      this.matchingThreshold = params.matchingThreshold;
    }
    if (params.amountTolerance !== undefined) {
      this.amountTolerance = params.amountTolerance;
    }
  }
}

// Export singleton instance
export const matchingAlgorithm = new MatchingAlgorithm();

// Export class for testing
export { MatchingAlgorithm };

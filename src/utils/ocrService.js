import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.worker = await Tesseract.createWorker('eng');
      this.isInitialized = true;
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async processImage(imageFile, onProgress = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.worker.recognize(imageFile, {
        logger: onProgress ? (m) => {
          if (m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        } : undefined
      });

      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processBankStatement(file, onProgress = null) {
    const ocrResult = await this.processImage(file, onProgress);
    
    if (!ocrResult.success) {
      return ocrResult;
    }

    // Parse the OCR text to extract transaction data
    const transactions = this.parseTransactions(ocrResult.text);
    
    return {
      success: true,
      rawText: ocrResult.text,
      confidence: ocrResult.confidence,
      transactions: transactions,
      metadata: {
        totalTransactions: transactions.length,
        processingDate: new Date().toISOString()
      }
    };
  }

  parseTransactions(text) {
    const transactions = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Common bank statement patterns
    const patterns = {
      // Date patterns: MM/DD/YYYY, MM-DD-YYYY, DD/MM/YYYY
      date: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      // Amount patterns: $123.45, 123.45, -123.45
      amount: /[\$\-]?(\d{1,3}(?:,\d{3})*\.?\d{0,2})/,
      // Debit/Credit indicators
      debitCredit: /(DEBIT|CREDIT|DR|CR|WITHDRAWAL|DEPOSIT)/i
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip header lines and empty lines
      if (this.isHeaderLine(line) || line.length < 10) {
        continue;
      }

      const dateMatch = line.match(patterns.date);
      const amountMatches = line.match(new RegExp(patterns.amount.source, 'g'));
      
      if (dateMatch && amountMatches) {
        // Extract the largest amount (likely the transaction amount)
        const amounts = amountMatches.map(amt => {
          const cleanAmount = amt.replace(/[\$,]/g, '');
          return parseFloat(cleanAmount);
        }).filter(amt => !isNaN(amt) && amt > 0);

        if (amounts.length > 0) {
          const transactionAmount = Math.max(...amounts);
          
          // Extract description (everything except date and amount)
          let description = line
            .replace(patterns.date, '')
            .replace(new RegExp(patterns.amount.source, 'g'), '')
            .replace(patterns.debitCredit, '')
            .trim()
            .replace(/\s+/g, ' ');

          // Clean up description
          description = this.cleanDescription(description);

          if (description.length > 3) {
            transactions.push({
              id: `ocr_${Date.now()}_${i}`,
              date: this.parseDate(dateMatch[1]),
              description: description,
              amount: transactionAmount,
              type: this.determineTransactionType(line),
              rawLine: line,
              confidence: this.calculateLineConfidence(line)
            });
          }
        }
      }
    }

    // Sort transactions by date (newest first)
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  isHeaderLine(line) {
    const headerKeywords = [
      'STATEMENT', 'ACCOUNT', 'BALANCE', 'DATE', 'DESCRIPTION', 
      'AMOUNT', 'TRANSACTION', 'BEGINNING', 'ENDING', 'TOTAL',
      'PAGE', 'BANK', 'CREDIT UNION'
    ];
    
    const upperLine = line.toUpperCase();
    return headerKeywords.some(keyword => upperLine.includes(keyword)) && 
           !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
  }

  cleanDescription(description) {
    // Remove common bank codes and clean up
    return description
      .replace(/\b(POS|ATM|ACH|CHK|DEP|WD|TFR|FEE)\b/gi, '')
      .replace(/\b\d{4,}\b/g, '') // Remove long numbers (likely reference numbers)
      .replace(/[#*]+/g, '') // Remove special characters
      .replace(/\s+/g, ' ')
      .trim();
  }

  parseDate(dateString) {
    // Handle different date formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/, // MM-DD-YYYY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let [, month, day, year] = match;
        
        // Handle 2-digit years
        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return dateString; // Return original if no format matches
  }

  determineTransactionType(line) {
    const upperLine = line.toUpperCase();
    
    if (upperLine.includes('DEBIT') || upperLine.includes('WITHDRAWAL') || 
        upperLine.includes('DR') || upperLine.includes('WD')) {
      return 'debit';
    }
    
    if (upperLine.includes('CREDIT') || upperLine.includes('DEPOSIT') || 
        upperLine.includes('CR') || upperLine.includes('DEP')) {
      return 'credit';
    }
    
    // Default to debit for expenses
    return 'debit';
  }

  calculateLineConfidence(line) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for well-structured lines
    if (line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)) confidence += 0.2; // Has date
    if (line.match(/\$?\d+\.\d{2}/)) confidence += 0.2; // Has proper amount format
    if (line.length > 20 && line.length < 100) confidence += 0.1; // Reasonable length
    
    return Math.min(confidence, 1.0);
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  // Utility method to validate extracted transactions
  validateTransactions(transactions) {
    return transactions.filter(transaction => {
      return (
        transaction.date &&
        transaction.description &&
        transaction.description.length > 2 &&
        transaction.amount &&
        transaction.amount > 0 &&
        !isNaN(transaction.amount)
      );
    });
  }

  // Method to suggest corrections for common OCR errors
  suggestCorrections(transactions) {
    return transactions.map(transaction => {
      const suggestions = [];
      
      // Check for common OCR misreads
      if (transaction.description.includes('0') && transaction.description.includes('O')) {
        suggestions.push('Check if O should be 0 or vice versa');
      }
      
      if (transaction.description.includes('1') && transaction.description.includes('l')) {
        suggestions.push('Check if l should be 1 or vice versa');
      }
      
      // Check for unrealistic amounts
      if (transaction.amount > 10000) {
        suggestions.push('Verify large amount - possible OCR error');
      }
      
      return {
        ...transaction,
        suggestions: suggestions
      };
    });
  }
}

// Export singleton instance
export const ocrService = new OCRService();

// Export class for testing
export { OCRService };

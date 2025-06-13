# 📋 Monthly Reconciliation Module Implementation Plan

**Target Version**: v1.8.0  
**Priority**: HIGH  
**Status**: In Development

---

## 1. Project Overview

This document outlines the implementation plan for the new Monthly Reconciliation Module, a key enhancement for the PTO Connect Budget Module. The goal is to create a streamlined, user-friendly workflow for reconciling monthly expenses against bank statements, ensuring financial accuracy and compliance.

### Key Features:
- **Guided Workflow**: A multi-step process similar to the Event Planner to guide users through reconciliation.
- **Bank Statement OCR**: Text recognition to extract transactions from scanned bank statements.
- **Automated Matching**: System-assisted matching of imported bank transactions with recorded expenses.
- **Discrepancy Reporting**: Clear identification and reporting of unreconciled items.
- **Reconciliation Reports**: Generation of detailed reports for auditing and record-keeping.

---

## 2. Technical Implementation

### 2.1. Frontend (React)

**New Components:**
- `ReconciliationDashboard.jsx`: Main view for the reconciliation module, listing past and in-progress reconciliations.
- `ReconciliationWizard.jsx`: A multi-step wizard to guide users through the reconciliation process.
  - **Step 1: Setup**: Select month, year, and relevant accounts.
  - **Step 2: Upload Statement**: Upload scanned bank statements.
  - **Step 3: Review & Match**: Review OCR-extracted transactions and match them with system expenses.
  - **Step 4: Resolve Discrepancies**: Address any unmatched or mismatched items.
  - **Step 5: Finalize & Report**: Generate and save the final reconciliation report.
- `StatementUploader.jsx`: A component for uploading bank statements with integrated OCR processing.
- `TransactionMatchingUI.jsx`: A dual-panel interface for matching bank transactions to system expenses.
- `ReconciliationReport.jsx`: A component to display and print the final reconciliation report.

**File Structure:**
```
pto-connect/src/components/budget/reconciliation/
├── ReconciliationDashboard.jsx
├── ReconciliationWizard.jsx
├── StatementUploader.jsx
├── TransactionMatchingUI.jsx
└── ReconciliationReport.jsx
```

### 2.2. Backend (Node.js/Express)

**New API Endpoints:**
- `POST /api/reconciliation/start`: Initialize a new reconciliation period.
- `POST /api/reconciliation/:id/upload`: Upload a bank statement and trigger OCR processing.
- `GET /api/reconciliation/:id/transactions`: Fetch transactions for a specific reconciliation.
- `POST /api/reconciliation/:id/match`: Match a bank transaction to a system expense.
- `POST /api/reconciliation/:id/finalize`: Complete the reconciliation and generate a report.

**OCR Integration:**
- Integrate a third-party OCR service (e.g., Google Cloud Vision, AWS Textract) to extract text from uploaded bank statements.
- Implement a parser to structure the extracted text into a standardized transaction format.

### 2.3. Database (Supabase/PostgreSQL)

**New Tables:**
- `reconciliations`: Stores information about each reconciliation instance (e.g., `id`, `org_id`, `month`, `year`, `status`).
- `bank_transactions`: Stores transactions extracted from bank statements (e.g., `id`, `reconciliation_id`, `date`, `description`, `amount`).
- `matched_transactions`: Links bank transactions to system expenses (e.g., `id`, `bank_transaction_id`, `expense_id`).

**Schema:**
```sql
CREATE TABLE reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  month INT NOT NULL,
  year INT NOT NULL,
  status TEXT NOT NULL, -- 'in_progress', 'completed'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID REFERENCES reconciliations(id),
  transaction_date DATE,
  description TEXT,
  amount DECIMAL(10, 2),
  is_matched BOOLEAN DEFAULT FALSE
);

CREATE TABLE matched_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID REFERENCES bank_transactions(id),
  expense_id UUID REFERENCES expenses(id),
  reconciliation_id UUID REFERENCES reconciliations(id)
);
```

---

## 3. Development Plan

### Sprint 1: Backend & Database
- **Task 1**: Implement database schema changes.
- **Task 2**: Develop API endpoints for starting and managing reconciliations.
- **Task 3**: Integrate OCR service for bank statement processing.

### Sprint 2: Frontend
- **Task 4**: Build the `ReconciliationDashboard` and `ReconciliationWizard` components.
- **Task 5**: Implement the `StatementUploader` and `TransactionMatchingUI`.
- **Task 6**: Develop the `ReconciliationReport` component.

### Sprint 3: Integration & Testing
- **Task 7**: Connect frontend components to backend APIs.
- **Task 8**: Conduct end-to-end testing of the reconciliation workflow.
- **Task 9**: Refine UI/UX based on feedback.

---

## 4. Success Criteria

- Users can successfully complete a monthly reconciliation in under 30 minutes.
- OCR accuracy is above 95% for common bank statement formats.
- The system correctly identifies and flags discrepancies between bank statements and system expenses.
- Reconciliation reports are comprehensive and suitable for auditing purposes.

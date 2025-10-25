import { z } from 'zod';
import { DualDbEntitySchema, CurrencyAmountSchema } from './base';

// Transaction categories
export const TransactionCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string(),
  parentId: z.string().optional(),
  isSystem: z.boolean().default(false)
});

// Account types
export const AccountTypeEnum = z.enum([
  'checking',
  'savings', 
  'credit_card',
  'investment',
  'loan',
  'mortgage',
  'other'
]);

// Financial accounts
export const FinancialAccountSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(100),
  type: AccountTypeEnum,
  institution: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  balance: CurrencyAmountSchema,
  currency: z.string().length(3).default('USD'),
  isActive: z.boolean().default(true),
  syncEnabled: z.boolean().default(false),
  lastSyncAt: z.date().optional(),
  plaidAccountId: z.string().optional(),
  plaidAccessToken: z.string().optional()
});

// Transaction types
export const TransactionTypeEnum = z.enum([
  'income',
  'expense', 
  'transfer',
  'investment',
  'fee'
]);

// Transaction status
export const TransactionStatusEnum = z.enum([
  'pending',
  'posted',
  'cleared',
  'cancelled',
  'failed'
]);

// Financial transactions
export const FinancialTransactionSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  accountId: z.string(),
  type: TransactionTypeEnum,
  status: TransactionStatusEnum.default('posted'),
  amount: CurrencyAmountSchema,
  currency: z.string().length(3).default('USD'),
  description: z.string().min(1).max(500),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  date: z.date(),
  postedDate: z.date().optional(),
  location: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  merchant: z.object({
    name: z.string(),
    category: z.string().optional(),
    website: z.string().url().optional()
  }).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
  recurringGroupId: z.string().optional(),
  plaidTransactionId: z.string().optional(),
  originalDescription: z.string().optional(),
  confidence: z.number().min(0).max(1).optional()
});

// Budget categories
export const BudgetCategorySchema = z.object({
  categoryId: z.string(),
  budgeted: CurrencyAmountSchema,
  spent: CurrencyAmountSchema.default(0),
  remaining: CurrencyAmountSchema.default(0),
  rollover: z.boolean().default(false)
});

// Monthly budgets
export const MonthlyBudgetSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  year: z.number().int().min(2000).max(3000),
  month: z.number().int().min(1).max(12),
  totalBudgeted: CurrencyAmountSchema.default(0),
  totalSpent: CurrencyAmountSchema.default(0),
  totalIncome: CurrencyAmountSchema.default(0),
  categories: z.array(BudgetCategorySchema).default([]),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional()
});

// Financial goals
export const FinancialGoalSchema = DualDbEntitySchema.extend({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum([
    'savings',
    'debt_payoff',
    'investment',
    'emergency_fund',
    'retirement',
    'vacation',
    'purchase',
    'other'
  ]),
  targetAmount: CurrencyAmountSchema,
  currentAmount: CurrencyAmountSchema.default(0),
  currency: z.string().length(3).default('USD'),
  targetDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
  linkedAccountId: z.string().optional(),
  autoContribute: z.boolean().default(false),
  monthlyContribution: CurrencyAmountSchema.optional()
});

export type FinancialAccount = z.infer<typeof FinancialAccountSchema>;
export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>;
export type MonthlyBudget = z.infer<typeof MonthlyBudgetSchema>;
export type FinancialGoal = z.infer<typeof FinancialGoalSchema>;
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;
export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;

// Create/Update schemas
export const CreateFinancialAccountSchema = FinancialAccountSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateFinancialTransactionSchema = FinancialTransactionSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateMonthlyBudgetSchema = MonthlyBudgetSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export const CreateFinancialGoalSchema = FinancialGoalSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  neo4jRef: true
});

export type CreateFinancialAccount = z.infer<typeof CreateFinancialAccountSchema>;
export type CreateFinancialTransaction = z.infer<typeof CreateFinancialTransactionSchema>;
export type CreateMonthlyBudget = z.infer<typeof CreateMonthlyBudgetSchema>;
export type CreateFinancialGoal = z.infer<typeof CreateFinancialGoalSchema>;
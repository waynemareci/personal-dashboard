import { z } from 'zod';
import { DualDbEntitySchema, EmailSchema, PhoneSchema } from './base';

// User preferences
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  currency: z.string().length(3).default('USD'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false)
  }).default({
    email: true,
    push: true,
    sms: false
  }),
  dashboard: z.object({
    widgets: z.array(z.string()).default(['financial', 'health', 'schedule']),
    layout: z.enum(['grid', 'list']).default('grid')
  }).default({
    widgets: ['financial', 'health', 'schedule'],
    layout: 'grid'
  })
});

// User profile
export const UserProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  avatar: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional()
  }).optional()
});

// Authentication info
export const AuthInfoSchema = z.object({
  passwordHash: z.string(),
  salt: z.string(),
  lastLoginAt: z.date().optional(),
  loginAttempts: z.number().default(0),
  lockedUntil: z.date().optional(),
  isEmailVerified: z.boolean().default(false),
  emailVerificationToken: z.string().optional(),
  emailVerificationExpires: z.date().optional(),
  passwordResetToken: z.string().optional(),
  passwordResetExpires: z.date().optional(),
  twoFactorEnabled: z.boolean().default(false),
  twoFactorSecret: z.string().optional()
});

// Main User schema
export const UserSchema = DualDbEntitySchema.extend({
  profile: UserProfileSchema,
  auth: AuthInfoSchema,
  preferences: UserPreferencesSchema.default({
    theme: 'auto',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      widgets: ['financial', 'health', 'schedule'],
      layout: 'grid'
    }
  }),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  roles: z.array(z.string()).default(['user']),
  subscriptions: z.array(z.object({
    type: z.string(),
    status: z.enum(['active', 'cancelled', 'expired']),
    startDate: z.date(),
    endDate: z.date().optional(),
    features: z.array(z.string())
  })).default([])
});

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type AuthInfo = z.infer<typeof AuthInfoSchema>;

// User creation/update schemas (excluding sensitive fields)
export const CreateUserSchema = z.object({
  profile: UserProfileSchema.omit({ email: true }).extend({
    email: EmailSchema
  }),
  preferences: UserPreferencesSchema.optional()
});

export const UpdateUserSchema = z.object({
  profile: UserProfileSchema.partial(),
  preferences: UserPreferencesSchema.partial()
});

export const UserPublicSchema = UserSchema.omit({
  auth: true
}).transform((user) => ({
  ...user,
  profile: {
    ...user.profile,
    // Remove sensitive profile info for public view
    email: user.profile.email.replace(/(.{2}).*@/, '$1***@')
  }
}));

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
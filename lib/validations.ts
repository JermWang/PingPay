import { z } from "zod"

/**
 * Validation schemas for API inputs
 * Using Zod for runtime type checking and validation
 */

// Common validations
export const solanaAddressSchema = z
  .string()
  .min(32)
  .max(44)
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format")

export const uuidSchema = z.string().uuid("Invalid UUID format")

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Creator schemas
export const creatorAuthSchema = z.object({
  walletAddress: solanaAddressSchema,
})

export const updateCreatorSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
})

// Service schemas
export const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  external_endpoint: z.string().url("Invalid URL format"),
  price_usd: z.coerce.number().positive("Price must be greater than 0").max(100, "Price cannot exceed $100"),
  category: z.enum([
    "Blockchain Data",
    "NFT Data",
    "Network Data",
    "DeFi",
    "Gaming",
    "Utilities",
    "AI/ML",
    "Social",
    "Analytics",
    "Other",
  ]),
  creator_id: uuidSchema,
  free_tier_limit: z.coerce.number().int().min(0).optional(),
  free_tier_period: z.enum(["daily", "monthly", "total"]).optional(),
})

export const updateServiceSchema = z.object({
  serviceId: uuidSchema,
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  external_endpoint: z.string().url().optional(),
  price_usd: z.coerce.number().positive().max(100).optional(),
  category: z
    .enum([
      "Blockchain Data",
      "NFT Data",
      "Network Data",
      "DeFi",
      "Gaming",
      "Utilities",
      "AI/ML",
      "Social",
      "Analytics",
      "Other",
    ])
    .optional(),
  is_active: z.boolean().optional(),
  free_tier_limit: z.coerce.number().int().min(0).optional(),
  free_tier_period: z.enum(["daily", "monthly", "total"]).optional(),
})

export const deleteServiceSchema = z.object({
  serviceId: uuidSchema,
})

// Review schemas
export const createReviewSchema = z.object({
  service_id: uuidSchema,
  user_wallet: solanaAddressSchema,
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review cannot exceed 1000 characters"),
})

export const getReviewsSchema = z.object({
  serviceId: uuidSchema.optional(),
  userWallet: solanaAddressSchema.optional(),
}).refine(data => data.serviceId || data.userWallet, {
  message: "Either serviceId or userWallet must be provided",
})

// Transaction schemas
export const transactionSignatureSchema = z
  .string()
  .min(87)
  .max(88)
  .regex(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/, "Invalid transaction signature format")

export const quoteIdSchema = uuidSchema

// x402 specific schemas
export const x402HeadersSchema = z.object({
  quoteId: quoteIdSchema.optional(),
  transactionSignature: transactionSignatureSchema.optional(),
})

// API query parameters for Solana endpoints
export const solanaBalanceSchema = z.object({
  address: solanaAddressSchema,
})

export const solanaTokensSchema = z.object({
  address: solanaAddressSchema,
})

export const solanaTransactionsSchema = z.object({
  address: solanaAddressSchema,
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const solanaNftSchema = z.object({
  mint: solanaAddressSchema,
})

export const solanaValidatorSchema = z.object({
  vote_account: solanaAddressSchema,
})

// Helper function to validate and parse
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => `${err.path.join(".")}: ${err.message}`),
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - replace potentially dangerous characters
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

export function sanitizeInput(input: string): string {
  // Trim whitespace and remove null bytes
  return input.trim().replace(/\0/g, "")
}


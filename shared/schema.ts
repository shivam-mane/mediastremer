import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Connected social media accounts
export const connectedAccounts = pgTable("connected_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform").notNull(), // 'linkedin', 'twitter', 'facebook'
  accountId: varchar("account_id").notNull(), // Platform-specific user ID
  accountName: varchar("account_name"), // Display name or username
  accountProfileUrl: varchar("account_profile_url"), // Profile image URL
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts history
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  platforms: text("platforms").array().notNull(), // Array of platform names
  publishedAt: timestamp("published_at").defaultNow(),
  status: varchar("status").notNull().default('published'), // 'published', 'failed', 'partial'
  createdAt: timestamp("created_at").defaultNow(),
});

// Publishing results - tracks individual platform publishing status
export const publishingResults = pgTable("publishing_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  platform: varchar("platform").notNull(),
  status: varchar("status").notNull(), // 'success', 'failed'
  platformPostId: varchar("platform_post_id"), // ID of the post on the platform
  platformPostUrl: varchar("platform_post_url"), // URL to the post on the platform
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  connectedAccounts: many(connectedAccounts),
  posts: many(posts),
}));

export const connectedAccountsRelations = relations(connectedAccounts, ({ one }) => ({
  user: one(users, {
    fields: [connectedAccounts.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  publishingResults: many(publishingResults),
}));

export const publishingResultsRelations = relations(publishingResults, ({ one }) => ({
  post: one(posts, {
    fields: [publishingResults.postId],
    references: [posts.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConnectedAccountSchema = createInsertSchema(connectedAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
  status: true,
});

export const insertPublishingResultSchema = createInsertSchema(publishingResults).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type InsertConnectedAccount = z.infer<typeof insertConnectedAccountSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type PublishingResult = typeof publishingResults.$inferSelect;
export type InsertPublishingResult = z.infer<typeof insertPublishingResultSchema>;

// Platform types
export type Platform = 'linkedin' | 'twitter' | 'facebook';

export const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'twitter', label: 'X (Twitter)', color: '#000000' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
];

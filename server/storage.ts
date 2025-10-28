// Referenced from javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  connectedAccounts,
  posts,
  publishingResults,
  type User,
  type UpsertUser,
  type ConnectedAccount,
  type InsertConnectedAccount,
  type Post,
  type InsertPost,
  type PublishingResult,
  type InsertPublishingResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Connected accounts operations
  getConnectedAccounts(userId: string): Promise<ConnectedAccount[]>;
  getConnectedAccount(id: string): Promise<ConnectedAccount | undefined>;
  createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount>;
  updateConnectedAccount(id: string, updates: Partial<InsertConnectedAccount>): Promise<ConnectedAccount | undefined>;
  deleteConnectedAccount(id: string): Promise<void>;
  
  // Posts operations
  getPosts(userId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostStatus(id: string, status: string): Promise<Post | undefined>;
  
  // Publishing results operations
  createPublishingResult(result: InsertPublishingResult): Promise<PublishingResult>;
  getPublishingResults(postId: string): Promise<PublishingResult[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Connected accounts operations
  async getConnectedAccounts(userId: string): Promise<ConnectedAccount[]> {
    return await db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.userId, userId))
      .orderBy(desc(connectedAccounts.createdAt));
  }

  async getConnectedAccount(id: string): Promise<ConnectedAccount | undefined> {
    const [account] = await db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.id, id));
    return account;
  }

  async createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount> {
    const [newAccount] = await db
      .insert(connectedAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateConnectedAccount(
    id: string,
    updates: Partial<InsertConnectedAccount>
  ): Promise<ConnectedAccount | undefined> {
    const [updated] = await db
      .update(connectedAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(connectedAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteConnectedAccount(id: string): Promise<void> {
    await db
      .delete(connectedAccounts)
      .where(eq(connectedAccounts.id, id));
  }

  // Posts operations
  async getPosts(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.publishedAt));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePostStatus(id: string, status: string): Promise<Post | undefined> {
    const [updated] = await db
      .update(posts)
      .set({ status })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  // Publishing results operations
  async createPublishingResult(result: InsertPublishingResult): Promise<PublishingResult> {
    const [newResult] = await db
      .insert(publishingResults)
      .values(result)
      .returning();
    return newResult;
  }

  async getPublishingResults(postId: string): Promise<PublishingResult[]> {
    return await db
      .select()
      .from(publishingResults)
      .where(eq(publishingResults.postId, postId));
  }
}

export const storage = new DatabaseStorage();

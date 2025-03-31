import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const ordinals = pgTable("ordinals", {
  id: serial("id").primaryKey(),
  ordinalId: text("ordinal_id").notNull().unique(),
  collectionName: text("collection_name").notNull(),
  imageUrl: text("image_url").notNull(),
  metadata: jsonb("metadata").notNull(),
  mintFee: integer("mint_fee").notNull(),
  isMinted: boolean("is_minted").notNull().default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  txId: text("tx_id").notNull().unique(),
  walletAddress: text("wallet_address").notNull(),
  ordinalId: text("ordinal_id").notNull(),
  status: text("status").notNull(), // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOrdinalSchema = createInsertSchema(ordinals).pick({
  ordinalId: true,
  collectionName: true,
  imageUrl: true,
  metadata: true,
  mintFee: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  txId: true,
  walletAddress: true,
  ordinalId: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrdinal = z.infer<typeof insertOrdinalSchema>;
export type Ordinal = typeof ordinals.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type ValidationResponse = {
  isValid: boolean;
  ordinal?: {
    ordinalId: string;
    collectionName: string;
    imageUrl: string;
  };
  message?: string;
};

export type MintResponse = {
  success: boolean;
  transaction?: {
    txId: string;
    status: string;
  };
  message?: string;
};

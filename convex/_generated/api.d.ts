/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminInvitations from "../adminInvitations.js";
import type * as analytics from "../analytics.js";
import type * as billing from "../billing.js";
import type * as billingNotifications from "../billingNotifications.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as dailySummary from "../dailySummary.js";
import type * as disbursements from "../disbursements.js";
import type * as emailVerification from "../emailVerification.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as payouts from "../payouts.js";
import type * as platformSettings from "../platformSettings.js";
import type * as products from "../products.js";
import type * as promotions from "../promotions.js";
import type * as referrals from "../referrals.js";
import type * as seed from "../seed.js";
import type * as setPassword from "../setPassword.js";
import type * as stores from "../stores.js";
import type * as subscriptions from "../subscriptions.js";
import type * as support from "../support.js";
import type * as tokenization from "../tokenization.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as whatsapp from "../whatsapp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminInvitations: typeof adminInvitations;
  analytics: typeof analytics;
  billing: typeof billing;
  billingNotifications: typeof billingNotifications;
  crons: typeof crons;
  customers: typeof customers;
  dailySummary: typeof dailySummary;
  disbursements: typeof disbursements;
  emailVerification: typeof emailVerification;
  notifications: typeof notifications;
  orders: typeof orders;
  payments: typeof payments;
  payouts: typeof payouts;
  platformSettings: typeof platformSettings;
  products: typeof products;
  promotions: typeof promotions;
  referrals: typeof referrals;
  seed: typeof seed;
  setPassword: typeof setPassword;
  stores: typeof stores;
  subscriptions: typeof subscriptions;
  support: typeof support;
  tokenization: typeof tokenization;
  transactions: typeof transactions;
  users: typeof users;
  webhooks: typeof webhooks;
  whatsapp: typeof whatsapp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as conversations from "../conversations.js";
import type * as emailActions from "../emailActions.js";
import type * as friends from "../friends.js";
import type * as functions from "../functions.js";
import type * as games from "../games.js";
import type * as http from "../http.js";
import type * as index from "../index.js";
import type * as matches from "../matches.js";
import type * as news from "../news.js";
import type * as profiles from "../profiles.js";
import type * as prompts from "../prompts.js";
import type * as reels from "../reels.js";
import type * as router from "../router.js";
import type * as stories from "../stories.js";
import type * as storyReactions from "../storyReactions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  conversations: typeof conversations;
  emailActions: typeof emailActions;
  friends: typeof friends;
  functions: typeof functions;
  games: typeof games;
  http: typeof http;
  index: typeof index;
  matches: typeof matches;
  news: typeof news;
  profiles: typeof profiles;
  prompts: typeof prompts;
  reels: typeof reels;
  router: typeof router;
  stories: typeof stories;
  storyReactions: typeof storyReactions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

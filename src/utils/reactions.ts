import { Actor } from 'apify';
import { Input, ScraperState } from '../main.js';
import { createLinkedinScraper } from '@harvestapi/scraper';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export async function scrapeReactionsForPost({
  post,
  state,
  input,
  concurrency,
  originalInput,
}: {
  input: Input;
  post: { id: string; linkedinUrl: string };
  state: ScraperState;
  concurrency: number;
  originalInput: Input;
}): Promise<{
  reactions: any[];
}> {
  if (!input.scrapeReactions || state.itemsLeft <= 0) {
    return { reactions: [] };
  }
  const client = Actor.newClient();
  const user = userId ? await client.user(userId).get() : null;

  const scraperLib = createLinkedinScraper({
    apiKey: process.env.HARVESTAPI_TOKEN!,
    baseUrl: process.env.HARVESTAPI_URL || 'https://api.harvest-api.com',
    addHeaders: {
      'x-apify-userid': userId!,
      'x-apify-actor-id': actorId!,
      'x-apify-actor-run-id': actorRunId!,
      'x-apify-actor-build-id': actorBuildId!,
      'x-apify-memory-mbytes': String(memoryMbytes),
      'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
      'x-apify-username': user?.username || '',
      'x-apify-user-is-paying': (user as Record<string, any> | null)?.isPaying,
    },
  });

  let postReactionsCounter = 0;
  let maxReactions = input.maxReactions || 1000000;
  if (maxReactions > state.itemsLeft) {
    maxReactions = state.itemsLeft;
  }

  const reactions: any[] = [];
  const query = {
    post: post.linkedinUrl || post.id,
  };

  await scraperLib.scrapePostReactions({
    query: query,
    outputType: 'callback',
    onItemScraped: async ({ item }) => {
      if (!item.id) return;
      postReactionsCounter++;
      delete (item as any).postId;
      (item as any).postId = post.id;

      console.info(`Scraped reaction ${postReactionsCounter} for post ${post.id}`);

      reactions.push(item);
      state.datasetLastPushPromise = Actor.pushData({
        type: 'reaction',
        ...item,
        input: originalInput,
        query,
      });
    },
    overrideConcurrency: concurrency,
    maxItems: maxReactions,
    disableLog: true,
  });

  state.itemsLeft -= postReactionsCounter;

  return { reactions };
}

import { Actor } from 'apify';
import { Input } from '../main.js';
import { createLinkedinScraper } from '@harvestapi/scraper';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export async function scrapeCommentsForPost({
  postId,
  state,
  input,
  concurrency,
}: {
  input: Input;
  postId: string;
  state: { itemsLeft: number };
  concurrency: number;
}): Promise<{
  comments: any[];
}> {
  if (!input.scrapeComments || state.itemsLeft <= 0) {
    return { comments: [] };
  }

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
    },
  });

  let itemsCounter = 0;
  let maxComments = input.maxComments || 1000000;
  if (maxComments > state.itemsLeft) {
    maxComments = state.itemsLeft;
  }
  const comments: any[] = [];

  await scraperLib.scrapePostComments({
    query: {
      post: postId,
    },
    outputType: 'callback',
    onItemScraped: async ({ item }) => {
      if (!item.id) return;
      itemsCounter++;
      delete (item as any).postId;
      console.info(`Scraped comment ${itemsCounter} for post ${postId}`);

      comments.push(item);
      await Actor.pushData({
        type: 'comment',
        postId: postId,
        ...(item as any),
      });
    },
    overrideConcurrency: concurrency,
    maxItems: maxComments,
    disableLog: true,
  });

  state.itemsLeft -= itemsCounter;

  return { comments };
}

import {
  ApiListResponse,
  createConcurrentQueues,
  createLinkedinScraper,
  PostShort,
} from '@harvestapi/scraper';
import { Actor } from 'apify';
import { subMonths } from 'date-fns';
import { Input, ScraperState } from '../main.js';
import { scrapeCommentsForPost } from './comments.js';
import { scrapeReactionsForPost } from './reactions.js';
import { getPostPushData } from './getPostPushData.js';
import { pick } from './misc.js';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export async function createHarvestApiScraper({
  concurrency,
  state,
  input,
  originalInput,
  reactionsConcurrency,
}: {
  state: ScraperState;
  input: Input;
  originalInput: Input;
  concurrency: number;
  reactionsConcurrency: number;
}) {
  let processedProfilesCounter = 0;

  const scrapedPostsPerProfile: Record<string, Record<string, boolean>> = {};
  const client = Actor.newClient();
  const user = userId ? await client.user(userId).get() : null;
  const cm = Actor.getChargingManager();
  const pricingInfo = cm.getPricingInfo();

  const scraper = createLinkedinScraper({
    apiKey: process.env.HARVESTAPI_TOKEN!,
    baseUrl: process.env.HARVESTAPI_URL || 'https://api.harvest-api.com',
    addHeaders: {
      'x-apify-userid': userId!,
      'x-apify-actor-id': actorId!,
      'x-apify-actor-run-id': actorRunId!,
      'x-apify-actor-build-id': actorBuildId!,
      'x-apify-memory-mbytes': String(memoryMbytes),
      'x-apify-username': user?.username || '',
      'x-apify-user-is-paying': (user as Record<string, any> | null)?.isPaying,
      'x-apify-max-total-charge-usd': String(pricingInfo.maxTotalChargeUsd),
      'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
    },
  });

  let maxDate: Date | null = null;

  if (input.postedLimit === '1h') {
    maxDate = new Date(Date.now() - 60 * 60 * 1000);
  } else if (input.postedLimit === '24h') {
    maxDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else if (input.postedLimit === 'week') {
    maxDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (input.postedLimit === 'month') {
    maxDate = subMonths(new Date(), 1);
  } else if (input.postedLimit === '3months') {
    maxDate = subMonths(new Date(), 3);
  } else if (input.postedLimit === '6months') {
    maxDate = subMonths(new Date(), 6);
  } else if (input.postedLimit === 'year') {
    maxDate = subMonths(new Date(), 12);
  }

  const pushPostData = getPostPushData({
    scraper,
    input,
    pricingInfo,
  });

  return {
    scrapedPostsPerProfile,
    addJob: createConcurrentQueues(
      concurrency,
      async ({
        index,
        params,
        scrapePages,
        maxPosts,
        total,
        useSessionId,
      }: {
        params: Record<string, string | string[]>;
        scrapePages: number;
        maxPosts: number | null;
        index: number;
        total: number;
        useSessionId: boolean;
      }) => {
        const sessionId = crypto.randomUUID();

        if (state.itemsLeft <= 0) {
          console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
          return;
        }
        for (const key of Object.keys(params) as Array<keyof typeof params>) {
          if (!params[key] || params[key] === 'undefined') {
            delete params[key];
          }
          if (Array.isArray(params[key]) && params[key].length === 0) {
            delete params[key];
          }
        }
        const entityKey = JSON.stringify(params);
        if (state.processedQueries[entityKey]) {
          console.info(`Skipping already processed query: ${entityKey}`);
          return;
        }

        console.info(`Fetching posts for ${entityKey}...`);
        // const timestamp = new Date();
        let postsCounter = 0;

        const startPage = Number(params.page) || 1;
        const endPage =
          typeof maxPosts === 'number' ? 100 : startPage + (Number(scrapePages) || 100);
        let maxDateReached = false;
        let paginationToken: string | null | undefined = null;
        const previouslyScrapedPageNumber = state.scrapedPageNumberPerQuery[entityKey] || null;

        for (let i = previouslyScrapedPageNumber || startPage; i < endPage; i++) {
          if (state.itemsLeft <= 0) {
            console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
            break;
          }
          if (maxPosts && postsCounter >= maxPosts) {
            console.info(`Reached maxPosts limit: ${maxPosts}`);
            break;
          }
          // if (maxDateReached) {
          //   console.info(`Max date reached for ${entityKey}, stopping further requests.`);
          //   break;
          // }

          let postsOnPageCounter = 0;

          const queryParams = {
            ...params,
            page: i,
            ...(paginationToken ? { paginationToken } : {}),
            sessionId: useSessionId ? sessionId : undefined,
          };

          const response: Partial<ApiListResponse<PostShort>> = await scraper
            .searchPosts(queryParams)
            .catch((error) => {
              console.error(`Error fetching posts:`, error);
              return {};
            });

          console.info(
            `Fetched page ${i} for ${entityKey}, received ${response.elements?.length || 0} posts. Total posts for this query: ${response.pagination?.totalResultCount || response.pagination?.totalElements}`,
          );
          paginationToken = response?.pagination?.paginationToken;

          if (response.elements && response.status && response.status < 400) {
            const postsPushPromises: Promise<void>[] = [];

            for (const post of response.elements) {
              if (state.itemsLeft <= 0) {
                console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
                break;
              }
              if (maxPosts && postsCounter >= maxPosts) {
                console.info(`Reached maxPosts limit: ${maxPosts}`);
                break;
              }

              const postPostedDate = post?.postedAt?.timestamp
                ? new Date(post?.postedAt?.timestamp)
                : null;

              if (maxDate && postPostedDate) {
                if (maxDate.getTime() > postPostedDate.getTime()) {
                  // console.info(
                  //   `Post id:${post.id} date ${postPostedDate.toISOString()} is older than maxDate ${maxDate.toISOString()}`,
                  // );
                  if (input.sortBy === 'date') {
                    maxDateReached = true;
                  }
                  continue;
                }
              }

              if (!post.id) {
                console.warn(`Post without ID found for ${entityKey}, skipping.`);
                continue;
              }

              scrapedPostsPerProfile[entityKey] = scrapedPostsPerProfile[entityKey] || {};
              if (scrapedPostsPerProfile[entityKey][post.id]) {
                console.info(`Post id:${post.id} already scraped for ${entityKey}, skipping.`);
                continue;
              }

              scrapedPostsPerProfile[entityKey][post.id] = true;
              postsCounter++;
              postsOnPageCounter++;
              state.itemsLeft -= 1;
              console.info(
                `Scraped post #${processedProfilesCounter}_${postsCounter} id:${post.id} for ${entityKey}`,
              );

              const { reactions } =
                post?.engagement?.likes || post?.engagement?.reactions
                  ? await scrapeReactionsForPost({
                      post,
                      state,
                      input,
                      originalInput,
                      concurrency: reactionsConcurrency,
                    }).catch((error) => {
                      console.error(`Error scraping reactions for post ${post.id}:`, error);
                      return { reactions: [] };
                    })
                  : { reactions: [] };

              const { comments } = !!post?.engagement?.comments
                ? await scrapeCommentsForPost({
                    post,
                    state,
                    input,
                    originalInput,
                    concurrency: reactionsConcurrency,
                  }).catch((error) => {
                    console.error(`Error scraping comments for post ${post.id}:`, error);
                    return { comments: [] };
                  })
                : { comments: [] };

              postsPushPromises.push(
                pushPostData({
                  item: {
                    type: 'post',
                    ...post,
                    reactions,
                    comments,
                    query: pick(queryParams, ['sessionId']).rest,
                  },
                }),
              );
            }
            await Promise.all(postsPushPromises);

            state.scrapedPageNumberPerQuery[entityKey] = i;
            await Actor.setValue('crawling-state', state);
          } else {
            const error = typeof response.error === 'object' ? response.error : response;
            if (typeof error === 'object') {
              delete error.user;
              delete error.credits;
            }
            console.error(
              `Error scraping item#${index + 1} ${entityKey}: ${JSON.stringify(error, null, 2)}`,
            );
          }

          if (postsOnPageCounter === 0) {
            console.info(`No posts found on page ${i}, stopping for ${entityKey}.`);
            break;
          }
        }

        // const elapsed = new Date().getTime() - timestamp.getTime();
        processedProfilesCounter++;
        state.processedQueries[entityKey] = true;
        await Actor.setValue('crawling-state', state);

        console.info(
          `Scraped posts for ${entityKey}. Posts found ${postsCounter}. Progress: ${processedProfilesCounter}/${total}`,
        );
      },
    ),
  };
}

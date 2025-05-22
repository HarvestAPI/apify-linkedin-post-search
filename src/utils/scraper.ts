import { Actor } from 'apify';
import { createConcurrentQueues } from './queue.js';
import { scrapeReactionsForPost } from './reactions.js';
import { Input } from '../main.js';
import { scrapeCommentsForPost } from './comments.js';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export function createHarvestApiScraper({
  concurrency,
  state,
  input,
  reactionsConcurrency,
}: {
  state: { itemsLeft: number };
  input: Input;
  concurrency: number;
  reactionsConcurrency: number;
}) {
  let processedProfilesCounter = 0;

  const scrapedPostsPerProfile: Record<string, Record<string, boolean>> = {};

  return {
    scrapedPostsPerProfile,
    addJob: createConcurrentQueues(
      concurrency,
      async ({
        index,
        search,
        params,
        scrapePages,
        maxPosts,
        total,
      }: {
        search: string;
        params: Record<string, string | string[]>;
        scrapePages: number;
        maxPosts: number | null;
        index: number;
        total: number;
      }) => {
        if (state.itemsLeft <= 0) {
          console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
          return;
        }
        const entityKey = search;

        console.info(`Fetching posts for ${entityKey}...`);
        // const timestamp = new Date();
        let postsCounter = 0;

        const startPage = Number(params.page) || 1;
        const endPage = typeof maxPosts === 'number' ? 200 : startPage + (Number(scrapePages) || 1);

        for (let i = startPage; i < endPage; i++) {
          if (state.itemsLeft <= 0) {
            console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
            break;
          }
          if (maxPosts && postsCounter >= maxPosts) {
            break;
          }

          let postsOnPageCounter = 0;

          const queryParams = new URLSearchParams({
            ...params,
            search,
            page: String(i),
          });

          const response = await fetch(
            `${process.env.HARVESTAPI_URL || 'https://api.harvest-api.com'}/linkedin/post-search?${queryParams.toString()}`,
            {
              headers: {
                'X-API-Key': process.env.HARVESTAPI_TOKEN!,
                'x-apify-userid': userId!,
                'x-apify-actor-id': actorId!,
                'x-apify-actor-run-id': actorRunId!,
                'x-apify-actor-build-id': actorBuildId!,
                'x-apify-memory-mbytes': String(memoryMbytes),
                'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
              },
            },
          )
            .then((response) => response.json())
            .catch((error) => {
              console.error(`Error fetching posts:`, error);
              return {};
            });

          if (response.elements && response.status < 400) {
            for (const post of response.elements) {
              if (state.itemsLeft <= 0) {
                console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
                break;
              }
              if (maxPosts && postsCounter >= maxPosts) {
                break;
              }

              if (post.id) {
                scrapedPostsPerProfile[entityKey] = scrapedPostsPerProfile[entityKey] || {};
                if (!scrapedPostsPerProfile[entityKey][post.id]) {
                  scrapedPostsPerProfile[entityKey][post.id] = true;
                  postsCounter++;
                  postsOnPageCounter++;
                  state.itemsLeft -= 1;
                  console.info(
                    `Scraped post #${processedProfilesCounter}_${postsCounter} id:${post.id} for ${entityKey}`,
                  );

                  const { reactions } = await scrapeReactionsForPost({
                    post,
                    state,
                    input,
                    concurrency: reactionsConcurrency,
                  }).catch((error) => {
                    console.error(`Error scraping reactions for post ${post.id}:`, error);
                    return { reactions: [] };
                  });

                  const { comments } = await scrapeCommentsForPost({
                    post,
                    state,
                    input,
                    concurrency: reactionsConcurrency,
                  }).catch((error) => {
                    console.error(`Error scraping comments for post ${post.id}:`, error);
                    return { comments: [] };
                  });

                  await Actor.pushData({
                    type: 'post',
                    ...post,
                    reactions,
                    comments,
                  });
                }
              }
            }
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
            break;
          }
        }

        // const elapsed = new Date().getTime() - timestamp.getTime();
        processedProfilesCounter++;

        console.info(
          `Scraped posts for ${entityKey}. Posts found ${postsCounter}. Progress: ${processedProfilesCounter}/${total}`,
        );
      },
    ),
  };
}

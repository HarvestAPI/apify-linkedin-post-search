import { createConcurrentQueues, LinkedinScraper, PostShort } from '@harvestapi/scraper';
import { Input } from '../main.js';
import { Actor, ActorPricingInfo } from 'apify';

export function getPostPushData({
  scraper,
  input,
  pricingInfo,
}: {
  scraper: LinkedinScraper;
  input: Input;
  pricingInfo: ActorPricingInfo;
}) {
  const shouldScrapeProfiles =
    input.profileScraperMode === 'main' ||
    input.profileScraperMode === 'full' ||
    input.profileScraperMode === 'full_email_search';

  const pushPostData = createConcurrentQueues(
    shouldScrapeProfiles ? 20 : 100,
    async ({
      item,
    }: {
      item: PostShort & { query: Record<string, string | number | string[]>; type: string };
    }) => {
      if (item.author?.linkedinUrl && shouldScrapeProfiles) {
        if (item.author.linkedinUrl.includes('linkedin.com/in/')) {
          const profile = await scraper
            .getProfile({
              url: item.author?.linkedinUrl,
              main: true,
            })
            .catch((err) => {
              console.warn(
                `Failed to fetch profile ${item.author?.linkedinUrl}: ${err.message}`,
                err,
              );
              return null;
            });
          if (profile?.element?.id) {
            if (pricingInfo.isPayPerEvent) {
              const profileChargeResult = await Actor.charge({ eventName: 'main-profile' });
              if (profileChargeResult.eventChargeLimitReached) {
                await Actor.exit({
                  statusMessage: 'max charge reached',
                });
              }
            }
            item.author = { ...item.author, ...profile.element };
          }
        } else {
          const company = await scraper
            .getCompany({
              url: item.author.linkedinUrl,
            })
            .catch((err) => {
              console.warn(
                `Failed to fetch company ${item.author?.linkedinUrl}: ${err.message}`,
                err,
              );
              return null;
            });

          if (company?.element?.id) {
            if (pricingInfo.isPayPerEvent) {
              const profileChargeResult = await Actor.charge({ eventName: 'main-profile' });
              if (profileChargeResult.eventChargeLimitReached) {
                await Actor.exit({
                  statusMessage: 'max charge reached',
                });
              }
            }

            item.author = { ...item.author, ...company.element };
          }
        }
      }

      await Actor.pushData({
        ...item,
      });
    },
  );

  return pushPostData;
}

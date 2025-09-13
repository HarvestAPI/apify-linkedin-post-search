// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
import { config } from 'dotenv';
import { createHarvestApiScraper } from './utils/scraper.js';

config();

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

export interface Input {
  searchQueries: string[];
  postedLimit?: 'any' | '24h' | 'week' | 'month' | '3months' | '6months' | 'year';
  sortBy: 'date' | 'relevance';
  page?: string;
  scrapePages?: string;
  maxPosts: number | string;
  profileUrls?: string[];
  profilePublicIdentifiers?: string[];
  profileIds?: string[];
  companyUrls?: string[];
  companyPublicIdentifiers?: string[];
  companyIds?: string[];
  authorsCompanyUrls?: string[];
  authorsCompanyUniversalName?: string[];
  authorsCompanyId?: string[];
  authorUrls?: string[];
  authorsCompanies?: string[];
  targetUrls?: string[];

  scrapeReactions?: boolean;
  maxReactions?: number;
  scrapeComments?: boolean;
  maxComments?: number;
  commentsPostedLimit?: 'any' | '24h' | 'week' | 'month' | '3months' | '6months' | 'year';
}
// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
input.searchQueries = (input.searchQueries || []).filter((q) => q && !!q.trim());

const originalInput = JSON.parse(JSON.stringify(input)); // deep copy to avoid mutation

const query: {
  companyUniversalName: string[];
  companyId: string[];
  profilePublicIdentifier: string[];
  profileId: string[];
  authorsCompany: string[];
  authorsCompanyUniversalName: string[];
  authorsCompanyId: string[];
  targetUrl: string[];
} = {
  companyUniversalName: [],
  companyId: [],
  profilePublicIdentifier: [],
  profileId: [],
  authorsCompanyUniversalName: [],
  authorsCompanyId: [],
  targetUrl: [],
  authorsCompany: [],
};

(input.profileUrls || []).forEach((url) => {
  query.profilePublicIdentifier.push(url);
});
(input.profilePublicIdentifiers || []).forEach((profilePublicIdentifier) => {
  query.profilePublicIdentifier.push(profilePublicIdentifier);
});
(input.profileIds || []).forEach((profileId) => {
  query.profileId.push(profileId);
});
(input.companyUrls || []).forEach((url) => {
  query.companyUniversalName.push(url);
});
(input.companyPublicIdentifiers || []).forEach((companyUniversalName) => {
  query.companyUniversalName.push(companyUniversalName);
});
(input.companyIds || []).forEach((companyId) => {
  query.companyId.push(companyId);
});
(input.authorsCompanyUniversalName || []).forEach((companyUniversalName) => {
  query.authorsCompanyUniversalName.push(companyUniversalName);
});
(input.authorsCompanyId || []).forEach((companyId) => {
  query.authorsCompanyId.push(companyId);
});
(input.authorsCompanyUrls || []).forEach((url) => {
  query.authorsCompanyUniversalName.push(url);
});
(input.authorUrls || []).forEach((targetUrl) => {
  query.targetUrl.push(targetUrl);
});
(input.targetUrls || []).forEach((targetUrl) => {
  query.targetUrl.push(targetUrl);
});
(input.authorsCompanies || []).forEach((authorsCompany) => {
  query.authorsCompany.push(authorsCompany);
});

input.searchQueries = input.searchQueries.filter((search) => {
  if (search.startsWith('https://') || search.startsWith('http://')) {
    query.targetUrl.push(search);
    return false; // Remove from search queries
  }
  return true;
});

const { actorMaxPaidDatasetItems } = Actor.getEnv();

export type ScraperState = {
  itemsLeft: number;
  datasetLastPushPromise?: Promise<any>;
};
const state: ScraperState = {
  itemsLeft: actorMaxPaidDatasetItems || 1000000,
};

const scraper = await createHarvestApiScraper({
  concurrency: 6,
  state,
  input,
  originalInput,
  reactionsConcurrency: 2,
});

const searchPromises = input.searchQueries.map((search, index) => {
  return scraper.addJob({
    params: {
      sortBy: input.sortBy,
      page: input.page || '1',
      search,
      ...query,
    },
    scrapePages: Number(input.scrapePages),
    maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
    index,
    total: input.searchQueries.length,
  });
});

if (!input.searchQueries?.length) {
  const profiles = [
    ...(query.profileId || []).map((profileId) => ({ profileId })),
    ...(query.profilePublicIdentifier || []).map((profilePublicIdentifier) => ({
      profilePublicIdentifier,
    })),
    ...(query.targetUrl || []).map((targetUrl) => ({ targetUrl })),
    ...(query.companyId || []).map((companyId) => ({ companyId })),
    ...(query.companyUniversalName || []).map((companyUniversalName) => ({ companyUniversalName })),
  ];

  const commonArgs = {
    scrapePages: Number(input.scrapePages),
    maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
    total: profiles.length,
  };

  const profilePromises = [
    ...[...profiles].map((profile, index) => {
      return scraper.addJob({
        params: {
          ...profile,
          sortBy: input.sortBy,
          page: input.page || '1',
        },
        index: index,
        ...commonArgs,
      });
    }),
  ];
  searchPromises.push(...profilePromises);
}

await Promise.all([...searchPromises]).catch((error) => {
  console.error(`Error scraping profiles:`, error);
});

await state.datasetLastPushPromise;

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();

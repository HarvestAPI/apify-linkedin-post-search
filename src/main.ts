// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
import { createHarvestApiScraper } from './utils/scraper.js';
import { config } from 'dotenv';

config();

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

interface Input {
  searchQueries: string[];
  postedLimit: '24h' | 'week' | 'month';
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
}
// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
input.searchQueries = (input.searchQueries || []).filter((q) => q && !!q.trim());
if (!input.searchQueries?.length)
  throw new Error('Search queries: at least one query is required!');

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
(input.authorsCompanies || []).forEach((authorsCompany) => {
  query.authorsCompany.push(authorsCompany);
});

const scraper = createHarvestApiScraper({
  concurrency: 6,
});

const promises = input.searchQueries.map((search, index) => {
  return scraper.addJob({
    search,
    params: {
      postedLimit: input.postedLimit,
      sortBy: input.sortBy,
      page: input.page || '1',
      ...query,
    },
    scrapePages: Number(input.scrapePages),
    maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
    index,
    total: input.searchQueries.length,
  });
});

await Promise.all([...promises]).catch((error) => {
  console.error(`Error scraping profiles:`, error);
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();

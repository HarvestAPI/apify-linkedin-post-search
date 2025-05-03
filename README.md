## LinkedIn Posts Search scraper

Our powerful tool helps you search posts by text and filter by LinkedIn profiles or companies without compromising security or violating platform policies.

### Key Benefits

- No cookies or account required: Access profile data without sharing cookies or risking account restrictions
- Low pricing: $2 per 1k posts.
- Fast response times deliver data in seconds 🚀
- No caching, fresh data.
- Concurrency: each actor works scraping 3 search queries at a time.

## How It Works

- (required) List of search queries (e.g., `Hiring software engineer`, Hiring full stack developer`)
- (optionally) List of LinkedIn profile/company URLs who posted the content
- (optionally) List of LinkedIn public identifiers who posted the content (e.g., `williamhgates` from `https://www.linkedin.com/in/williamhgates`)
- (optionally) List if LinkedIn profile/company IDs who posted the content (e.g. ACoAAA8BYqEBCGLg_vT_ca6mMEqkpp9nVffJ3hc)
- (optionally) List of LinkedIn companies where authors work (e.g., `Microsoft`, `Google`).

For example you can search posts by Google (or other company) employees who hire software engineers:

```json
{
  "searchQueries": [
    "Hiring software engineer",
    "Hiring full stack developer",
    "Hiring backend developer"
  ],
  "authorsCompanyPublicIdentifiers": ["google", "microsoft", "amazon", "meta"]
}
```

**This is Post Search scraper, so list of search queries is required. If you don't care about search queries, and you want to scrape all posts from specific companies or authors, our [LinkedIn Profile Posts Scraper](https://apify.com/harvestapi/linkedin-profile-posts) works better for this use-case**

Other params (optionally):

- `maxPosts` - Maximum number of posts to scrape per each search query. This overrides `scrapePages` pagination. If you set this to 0, it will scrape all posts.
- `scrapePages` - Number of pages to scrape, if `maxPosts` is not set. Each page is 20 posts.
- `page` - Page number to start scraping from. Default is 1.

### Data You'll Receive

- Post content
- Author information
- Social engagement metrics
- Media: images, videos, and links
- Content of Re-posts

Up to 1000 posts per one actor run.

### Sample output data

Here is the example post output of this actor:

```json
{
  "id": "7324184462546677761",
  "content": "My team is #hiring a Software Development Engineer to help build the future of Amazon Marketing Tech. We have a critical mission: transforming how Amazon shows up to customers at scale. Do you know anyone who might be interested?",
  "title": null,
  "subtitle": null,
  "link": null,
  "linkLabel": null,
  "description": null,
  "authorUniversalName": null,
  "authorPublicIdentifier": "gaoqunbo",
  "authorType": "profile",
  "authorName": "Kate Gao",
  "authorLinkedinUrl": "https://www.linkedin.com/in/gaoqunbo?miniProfileUrn=urn%3Ali%3Afsd_profile%3AACoAABUJtmcBwqio62D594inx4a37ym9hCIW0U4",
  "authorInfo": "Software Development Manager at Amazon",
  "authorWebsite": null,
  "authorWebsiteLabel": null,
  "authorAvatar": {
    "url": "https://media.licdn.com/dms/image/v2/D5635AQEI-ApPyb66cw/profile-framedphoto-shrink_800_800/B56ZaS69bvHUAk-/0/1746221652117?e=1746900000&v=beta&t=WcNOd8DzwayA3kgDVPHJymvQMqLJvNhxHH68a_H-qz0",
    "width": 800,
    "height": 800,
    "expiresAt": 1746900000000
  },
  "postedAgo": "19h",
  "postImage": null,
  "postImages": [],
  "postVideo": null,
  "repostId": null,
  "repostedBy": null,
  "newsletterUrl": null,
  "newsletterTitle": null,
  "socialContent": {
    "hideCommentsCount": false,
    "hideReactionsCount": false,
    "hideSocialActivityCounts": false,
    "hideShareAction": false,
    "hideSendAction": false,
    "hideRepostsCount": false,
    "hideViewsCount": false,
    "hideReactAction": false,
    "hideCommentAction": false,
    "shareUrl": "https://www.linkedin.com/posts/gaoqunbo_hiring-activity-7324184462546677761-JqZw?utm_source=combined_share_message&utm_medium=member_desktop_web&rcm=ACoAAEwIeUIB_gsyqdC2fajTw2ymxt-UYExdbTE",
    "showContributionExperience": false,
    "showSocialDetail": true
  },
  "engagement": {
    "likes": 15,
    "comments": 5,
    "shares": 4,
    "reactions": [
      {
        "type": "LIKE",
        "count": 15
      }
    ]
  }
}
```

## Linkedin profiles API

The actor stores results in a dataset. You can export data in various formats such as CSV, JSON, XLS, etc. You can scrape and access data on demand using API.

### Support and Feedback

We continuously enhance our tools based on user feedback. If you encounter technical issues or have suggestions for improvement:

- Create an issue on the actor’s Issues tab in Apify Console
- Contacts us at contact@harvest-api.com

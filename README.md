## LinkedIn Posts Search scraper

Our powerful tool helps you search posts by text and filter by LinkedIn profiles or companies without compromising security or violating platform policies. Extract full post data, engagement metrics, and additionally scrape reactions and comments. This greatly helps with engagement analysis and outreach purposes.

### Key Benefits

- No cookies or account required: Access profile data without sharing cookies or risking account restrictions
- Low pricing: $2 per 1k posts.
- Fast response times deliver data in seconds 🚀
- No caching, fresh data.
- Concurrency: the actor scrapes 6 search queries at a time.

## How It Works

`targetUrls` List of LinkedIn profile/company URLs who posted or re-posted the content.

- (required) List of search queries (e.g., `property for sale in Florida`)
- (optionally) List of LinkedIn profile/company URLs who posted or re-posted the content
- (optionally) List of LinkedIn public identifiers who posted or re-posted the content (e.g., `williamhgates` from `https://www.linkedin.com/in/williamhgates`)
- (optionally) List if LinkedIn profile/company IDs who posted or re-posted the content (e.g. ACoAAA8BYqEBCGLg_vT_ca6mMEqkpp9nVffJ3hc)
- (optionally) List of LinkedIn companies where authors of posts work (e.g., `Microsoft`, `Google`).

Note: This is Post Search scraper, so list of search queries is required. If you don't need to scrape specific search queries, and you want to scrape all posts from specific companies or authors, our [LinkedIn Profile Posts Scraper](https://apify.com/harvestapi/linkedin-profile-posts) works better for this use-case

Additional content:

- `scrapeReactions` - Enable to scrape reactions to posts. Default is `false`. Reactions will be charged as a separate post and pushed into the dataset. Each post will also contain a nested list of its own reactions.
- `maxReactions` - Maximum number of reactions to scrape per post. If you set this to 0, it will scrape all reactions.
- `scrapeComments` - Enable to scrape comments to posts. Default is `false`. Comments will be charged as a separate post and pushed into the dataset. Each post will also contain a nested list of its own comments.
- `maxComments` - Maximum number of comments to scrape per post. If you set this to 0, it will scrape all comments.

Other params (optionally):

- `postedLimit` - Fetch posts no older than X time. Options: '24h', 'week', 'month'.
- `sortBy` - Sort by 'relevance' (of the search query) or 'date' (newest first).
- `maxPosts` - Maximum number of posts to scrape per each search query. This overrides `scrapePages` pagination. If you set this to 0, it will scrape all posts.
- `scrapePages` - Number of pages to scrape, if `maxPosts` is not set. Each page is 20 posts.
- `page` - Page number to start scraping from. Default is 1.

### Data You'll Receive

- Post content
- Author information
- Social engagement metrics
- Media: images, videos, and links
- Content of Re-posts
- Comments and reactions (if enabled, each item will be charged as a separate post)

### Sample output data

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

Here is the example post output of this actor:

```json
{
  "type": "post",
  "id": "7330988768578920448",
  "linkedinUrl": "https://www.linkedin.com/posts/nickbennett05_hiring-activity-7330988768578920448-Je01",
  "content": "I’m #hiring. Are you passionate about the intersection of physical and virtual worlds, including AI-powered systems and agent-based workflows? If so, I'm hiring for an exciting position on my team. See the details below.",
  "author": {
    "universalName": null,
    "publicIdentifier": "nickbennett05",
    "type": "profile",
    "name": "Nick Bennett",
    "linkedinUrl": "https://www.linkedin.com/in/nickbennett05?miniProfileUrn=urn%3Ali%3Afsd_profile%3AACoAAAMs-kQBF8xYdTGLvYN4zwhqDGh2UlSXIpY",
    "info": "UX Leadership at Amazon | Amazon Fulfillment Technology | UXMC",
    "website": null,
    "websiteLabel": null,
    "avatar": {
      "url": "https://media.licdn.com/dms/image/v2/D4D35AQEiacuf_U3fqQ/profile-framedphoto-shrink_800_800/B4DZbzmaiuGkAg-/0/1747843656196?e=1748552400&v=beta&t=Tr-pqK_0lShKXF6FqeqSrGMqlZabG26Nt6FyAEiIzWs",
      "width": 674,
      "height": 674,
      "expiresAt": 1748552400000
    }
  },
  "postedAt": {
    "timestamp": 1747843925614,
    "date": "2025-05-21T16:12:05.614Z",
    "postedAgoShort": "1d",
    "postedAgoText": "1 day ago • Visible to anyone on or off LinkedIn"
  },
  "postImages": [],
  "socialContent": {
    "hideCommentsCount": false,
    "hideReactionsCount": false,
    "hideSocialActivityCounts": false,
    "hideShareAction": true,
    "hideSendAction": true,
    "hideRepostsCount": false,
    "hideViewsCount": false,
    "hideReactAction": false,
    "hideCommentAction": false,
    "shareUrl": "https://www.linkedin.com/posts/nickbennett05_hiring-activity-7330988768578920448-Je01?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAExUClQBdCKsvo8NLfk3HZMfrSLtXnxHlNs",
    "showContributionExperience": false,
    "showSocialDetail": true
  },
  "engagement": {
    "likes": 13,
    "comments": 1,
    "shares": 9,
    "reactions": [
      {
        "type": "LIKE",
        "count": 12
      },
      {
        "type": "PRAISE",
        "count": 1
      }
    ]
  },
  "reactions": [
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAASSLvYBzlarj2-kg7kwLu1Kg8l3d9V8GlM,urn:li:ugcPost:7330988767496876032,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAASSLvYBzlarj2-kg7kwLu1Kg8l3d9V8GlM",
        "name": "Peiyao Feng",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAASSLvYBzlarj2-kg7kwLu1Kg8l3d9V8GlM",
        "position": "Head of Product and Engineering @ Amazon | MBA, Gen AI and LLM for eCommerce, Last Mile Logistics Optimization",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/C5603AQF5NVDoGIIEnw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1631913556503?e=1753315200&v=beta&t=X3B2Wg84t4XTF4VEWHs2eHJV8_bha7tGtlYz9nHcHww",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/C5603AQF5NVDoGIIEnw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1631913556503?e=1753315200&v=beta&t=X3B2Wg84t4XTF4VEWHs2eHJV8_bha7tGtlYz9nHcHww",
          "width": 120,
          "height": 120,
          "expiresAt": 1753315200000
        }
      }
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAACBISIBNox0_dNka7Zwftd78QpXyGR3aQc,urn:li:ugcPost:7330988767496876032,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAACBISIBNox0_dNka7Zwftd78QpXyGR3aQc",
        "name": "Gene Fojtik",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAACBISIBNox0_dNka7Zwftd78QpXyGR3aQc",
        "position": "LEADER | BAR RAISER | TECHNOLOGIST"
      }
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAAS2TewBuWaYsw5ywgFLlMFZ-0V3w5g1m0Q,urn:li:ugcPost:7330988767496876032,0)",
      "reactionType": "PRAISE",
      "actor": {
        "id": "ACoAAAS2TewBuWaYsw5ywgFLlMFZ-0V3w5g1m0Q",
        "name": "Christina Bencho-Bost",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAAS2TewBuWaYsw5ywgFLlMFZ-0V3w5g1m0Q",
        "position": "Principal-Tech Amazon Fulfillment Technologies",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/C4D03AQGtZsTRqf8qdw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1589406292311?e=1753315200&v=beta&t=2r6RPeDCXCH1vgx8vdJb-30McSJbrV9y0BDyZ5G1RQ4",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/C4D03AQGtZsTRqf8qdw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1589406292311?e=1753315200&v=beta&t=2r6RPeDCXCH1vgx8vdJb-30McSJbrV9y0BDyZ5G1RQ4",
          "width": 560,
          "height": 560,
          "expiresAt": 1753315200000
        }
      }
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAADtt8sBIKXReBKPk22Eb841pr04ibVrARM,urn:li:ugcPost:7330988767496876032,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAADtt8sBIKXReBKPk22Eb841pr04ibVrARM",
        "name": "Amirtha Raman",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAADtt8sBIKXReBKPk22Eb841pr04ibVrARM",
        "position": "Builder. Creative. Writer"
      }
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAAOMTswBbUE8kc0Z4Gh7gOQnijkSpA55gCk,urn:li:ugcPost:7330988767496876032,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAAOMTswBbUE8kc0Z4Gh7gOQnijkSpA55gCk",
        "name": "Laxmikant Rathi",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAAOMTswBbUE8kc0Z4Gh7gOQnijkSpA55gCk",
        "position": "Software Development Manager at Amazon",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/C5603AQEP80WXyhiCxA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1521780629574?e=1753315200&v=beta&t=Cx_5iHIBthQJ5BH-rld-aCKZyOErzC0IqdfFTsnqMSw",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/C5603AQEP80WXyhiCxA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1521780629574?e=1753315200&v=beta&t=Cx_5iHIBthQJ5BH-rld-aCKZyOErzC0IqdfFTsnqMSw",
          "width": 424,
          "height": 424,
          "expiresAt": 1753315200000
        }
      }
    }
  ],
  "comments": [
    {
      "id": "7331154096848097280",
      "linkedinUrl": "https://www.linkedin.com/feed/update/urn:li:ugcPost:7330988767496876032?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7330988767496876032%2C7331154096848097280%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287331154096848097280%2Curn%3Ali%3AugcPost%3A7330988767496876032%29",
      "commentary": "Come work with us! @Nick Bennett is amazing and you will work on cutting edge problem space. \n\nCommenting for reach.",
      "createdAt": "2025-05-22T03:09:02.946Z",
      "numComments": 0,
      "numShares": null,
      "numImpressions": null,
      "reactionTypeCounts": [
        {
          "type": "LIKE",
          "count": 1
        }
      ],
      "actor": {
        "id": "ACoAAADtt8sBIKXReBKPk22Eb841pr04ibVrARM",
        "name": "Amirtha Raman",
        "linkedinUrl": "https://www.linkedin.com/in/amirtharaman",
        "position": "Builder. Creative. Writer",
        "author": false
      },
      "createdAtTimestamp": 1747883342946,
      "pinned": false,
      "contributed": false,
      "edited": false
    }
  ]
}
```

## Linkedin Post Search API

The actor stores results in a dataset. You can export data in various formats such as CSV, JSON, XLS, etc. You can scrape and access data on demand using API.

### Support and Feedback

We continuously enhance our tools based on user feedback. If you encounter technical issues or have suggestions for improvement:

- Create an issue on the actor’s Issues tab in Apify Console
- Chat with us on our [Discord server](https://discord.gg/TGA9k9u2gE)
- Or contact us at contact@harvest-api.com

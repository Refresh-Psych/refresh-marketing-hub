/**
 * ═══════════════════════════════════════════════════════════════
 * REFRESH PSYCHIATRY — Daily Viral Mental Health Content Updater
 * ═══════════════════════════════════════════════════════════════
 *
 * This Google Apps Script fetches trending mental health content daily
 * and writes it to a Google Sheet. The dashboard reads from the sheet.
 *
 * SETUP:
 * 1. In your "Refresh Psychiatry Analytics Data" spreadsheet,
 *    create a new tab called "ViralContent"
 * 2. Add these headers in row 1:
 *    Rank | Platform | Emoji | Title | Creator | Description | Views | Likes | Shares | Takeaway | Link | Date
 * 3. Paste this script into Extensions → Apps Script (same project as GA4)
 * 4. Add a daily trigger for "updateViralContent" (same as GA4 trigger setup)
 *
 * The script searches social media APIs and news sources for trending
 * mental health content and curates the top 15 posts.
 * ═══════════════════════════════════════════════════════════════
 */

const VIRAL_SHEET_NAME = 'ViralContent';

// Mental health search queries to rotate through
const SEARCH_QUERIES = [
  'viral mental health tiktok',
  'trending psychiatry content',
  'ADHD viral social media',
  'anxiety tips trending',
  'therapy trending tiktok instagram',
  'mental health awareness viral',
  'psychiatrist social media',
  'depression trending content',
  'mindfulness viral reel',
  'burnout trending post'
];

// Platform-specific search configurations
const PLATFORMS = {
  tiktok: { emoji: '📱', label: 'TikTok', color: '#000000', bgClass: 'tiktok-bg' },
  instagram: { emoji: '📸', label: 'Instagram', color: '#833AB4', bgClass: 'instagram-bg' },
  youtube: { emoji: '🎬', label: 'YouTube', color: '#FF0000', bgClass: 'youtube-bg' },
  twitter: { emoji: '🐦', label: 'X / Twitter', color: '#1DA1F2', bgClass: 'twitter-bg' },
  reddit: { emoji: '🟠', label: 'Reddit', color: '#FF4500', bgClass: 'reddit-bg' },
  linkedin: { emoji: '💼', label: 'LinkedIn', color: '#0A66C2', bgClass: 'linkedin-bg' },
  facebook: { emoji: '👤', label: 'Facebook', color: '#1877F2', bgClass: 'facebook-bg' }
};

/**
 * Main function — call this daily via trigger
 * Searches multiple sources for trending mental health content
 */
function updateViralContent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VIRAL_SHEET_NAME);
  if (!sheet) {
    Logger.log('Sheet "' + VIRAL_SHEET_NAME + '" not found. Create it first!');
    return;
  }

  const today = new Date();
  const dateStr = Utilities.formatDate(today, 'America/New_York', 'MMMM d, yyyy');

  // Fetch trending content from multiple sources
  let allContent = [];

  // 1. YouTube Data API (if key provided)
  const ytContent = fetchYouTubeTrending();
  if (ytContent.length > 0) allContent = allContent.concat(ytContent);

  // 2. Reddit JSON API (no key needed)
  const redditContent = fetchRedditTrending();
  if (redditContent.length > 0) allContent = allContent.concat(redditContent);

  // 3. Google Trends / News for mental health topics
  const newsContent = fetchMentalHealthNews();
  if (newsContent.length > 0) allContent = allContent.concat(newsContent);

  // Sort by engagement score and take top 15
  allContent.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
  const top15 = allContent.slice(0, 15);

  // Clear old data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 12).clearContent();
  }

  // Write new data
  top15.forEach(function(item, idx) {
    const row = idx + 2;
    sheet.getRange(row, 1).setValue(idx + 1);              // Rank
    sheet.getRange(row, 2).setValue(item.platform);          // Platform
    sheet.getRange(row, 3).setValue(item.emoji || '🧠');     // Emoji
    sheet.getRange(row, 4).setValue(item.title);             // Title
    sheet.getRange(row, 5).setValue(item.creator);           // Creator
    sheet.getRange(row, 6).setValue(item.description);       // Description
    sheet.getRange(row, 7).setValue(item.views || '');        // Views
    sheet.getRange(row, 8).setValue(item.likes || '');        // Likes
    sheet.getRange(row, 9).setValue(item.shares || '');       // Shares
    sheet.getRange(row, 10).setValue(item.takeaway || '');    // Takeaway for Refresh
    sheet.getRange(row, 11).setValue(item.link || '');        // Link
    sheet.getRange(row, 12).setValue(dateStr);                // Date updated
  });

  // Update timestamp
  sheet.getRange('N1').setValue('Last Updated');
  sheet.getRange('N2').setValue(today);

  Logger.log('Updated ' + top15.length + ' viral content items on ' + dateStr);
}

/**
 * Fetch trending mental health videos from YouTube
 * Requires: YouTube Data API v3 key (set below)
 */
const YOUTUBE_API_KEY = ''; // Add your YouTube Data API key here

function fetchYouTubeTrending() {
  if (!YOUTUBE_API_KEY) {
    Logger.log('No YouTube API key set. Skipping YouTube fetch.');
    return [];
  }

  const results = [];
  const queries = [
    'mental health tips 2026',
    'ADHD diagnosed adult',
    'anxiety coping psychiatrist',
    'therapy techniques trending',
    'burnout recovery mental health'
  ];

  queries.forEach(function(query) {
    try {
      const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' +
        encodeURIComponent(query) +
        '&type=video&order=viewCount&publishedAfter=' +
        getDateDaysAgo(30) + 'T00:00:00Z' +
        '&maxResults=3&key=' + YOUTUBE_API_KEY;

      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const data = JSON.parse(response.getContentText());

      if (data.items) {
        data.items.forEach(function(item) {
          // Get video statistics
          const statsUrl = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' +
            item.id.videoId + '&key=' + YOUTUBE_API_KEY;
          const statsRes = UrlFetchApp.fetch(statsUrl, { muteHttpExceptions: true });
          const statsData = JSON.parse(statsRes.getContentText());
          const stats = statsData.items && statsData.items[0] ? statsData.items[0].statistics : {};

          results.push({
            platform: 'youtube',
            emoji: '🎬',
            title: item.snippet.title,
            creator: item.snippet.channelTitle,
            description: item.snippet.description.substring(0, 200),
            views: formatNumber(parseInt(stats.viewCount || 0)) + ' views',
            likes: formatNumber(parseInt(stats.likeCount || 0)) + ' likes',
            shares: formatNumber(parseInt(stats.commentCount || 0)) + ' comments',
            link: 'https://www.youtube.com/watch?v=' + item.id.videoId,
            engagementScore: parseInt(stats.viewCount || 0),
            takeaway: generateTakeaway(item.snippet.title, 'youtube')
          });
        });
      }
    } catch(e) {
      Logger.log('YouTube fetch error for "' + query + '": ' + e.message);
    }
  });

  return results;
}

/**
 * Fetch trending mental health posts from Reddit (no API key needed)
 */
function fetchRedditTrending() {
  const results = [];
  const subreddits = ['mentalhealth', 'ADHD', 'anxiety', 'depression', 'therapy', 'psychiatry'];

  subreddits.forEach(function(sub) {
    try {
      const url = 'https://www.reddit.com/r/' + sub + '/hot.json?limit=5';
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'RefreshPsychDashboard/1.0' }
      });
      const data = JSON.parse(response.getContentText());

      if (data.data && data.data.children) {
        data.data.children.forEach(function(post) {
          const d = post.data;
          if (d.score > 100) { // Only include posts with decent engagement
            results.push({
              platform: 'reddit',
              emoji: '🟠',
              title: d.title.substring(0, 100),
              creator: 'u/' + d.author + ' · r/' + sub,
              description: (d.selftext || '').substring(0, 200),
              views: '',
              likes: formatNumber(d.score) + ' upvotes',
              shares: formatNumber(d.num_comments) + ' comments',
              link: 'https://www.reddit.com' + d.permalink,
              engagementScore: d.score + (d.num_comments * 5),
              takeaway: generateTakeaway(d.title, 'reddit')
            });
          }
        });
      }
    } catch(e) {
      Logger.log('Reddit fetch error for r/' + sub + ': ' + e.message);
    }
  });

  return results;
}

/**
 * Fetch mental health news from Google News RSS
 */
function fetchMentalHealthNews() {
  const results = [];
  const queries = ['mental+health+viral', 'psychiatry+trending', 'ADHD+awareness+social+media'];

  queries.forEach(function(query) {
    try {
      const url = 'https://news.google.com/rss/search?q=' + query + '&hl=en-US&gl=US&ceid=US:en';
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const xml = XmlService.parse(response.getContentText());
      const root = xml.getRootElement();
      const channel = root.getChild('channel');
      const items = channel.getChildren('item');

      items.slice(0, 3).forEach(function(item) {
        const title = item.getChildText('title') || '';
        const link = item.getChildText('link') || '';
        const desc = item.getChildText('description') || '';
        const source = item.getChildText('source') || 'News';

        results.push({
          platform: 'twitter', // News often trends on X/Twitter
          emoji: '📰',
          title: title.substring(0, 100),
          creator: source,
          description: desc.replace(/<[^>]*>/g, '').substring(0, 200),
          views: '',
          likes: '',
          shares: '',
          link: link,
          engagementScore: 500, // Base score for news articles
          takeaway: generateTakeaway(title, 'news')
        });
      });
    } catch(e) {
      Logger.log('News fetch error: ' + e.message);
    }
  });

  return results;
}

/**
 * Generate a practice-specific takeaway based on the content
 */
function generateTakeaway(title, platform) {
  const lower = title.toLowerCase();

  if (lower.includes('adhd')) {
    return 'Create ADHD-focused content for Refresh — adult ADHD evaluation is a high-converting service. Position Refresh as the local expert with insurance-accepted ADHD care across 16 FL locations.';
  } else if (lower.includes('anxiety') || lower.includes('panic')) {
    return 'Anxiety is the #1 search driver for psychiatry. Film a quick "anxiety tip" Reel with a Refresh provider and link to your booking page for anxiety treatment.';
  } else if (lower.includes('depression') || lower.includes('depressed')) {
    return 'Depression content drives high engagement. Create an empathetic post about recognizing depression signs and Refresh\'s evidence-based treatment options (therapy + medication management).';
  } else if (lower.includes('therapy') || lower.includes('therapist')) {
    return 'Therapy-related viral content normalizes seeking help. Amplify this by sharing how Refresh combines therapy with psychiatric care for comprehensive mental wellness.';
  } else if (lower.includes('burnout') || lower.includes('stress')) {
    return 'Burnout content resonates with professionals — a key demographic for telepsychiatry. Create content targeting FL professionals who can access Refresh from home via telehealth.';
  } else if (lower.includes('medication') || lower.includes('meds')) {
    return 'Medication discussions drive high engagement. A Refresh psychiatrist can create myth-busting content about psychiatric medication, building trust and reducing stigma.';
  } else if (lower.includes('sleep') || lower.includes('insomnia')) {
    return 'Sleep content is highly shareable. Film a "sleep hygiene in 60 seconds" Reel — then mention Refresh treats the underlying anxiety/depression causing insomnia.';
  } else {
    return 'Trending mental health content — consider creating a Refresh-branded version with a clinical perspective. Positions Dr. Nepa and the Refresh team as accessible, evidence-based experts.';
  }
}

// ═══════ UTILITY FUNCTIONS ═══════

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return Utilities.formatDate(d, 'America/New_York', 'yyyy-MM-dd');
}

/**
 * Combined daily function — add to your existing dailyFullPull() or run separately
 */
function dailyViralUpdate() {
  updateViralContent();
  Logger.log('Daily viral content update complete at ' + new Date());
}

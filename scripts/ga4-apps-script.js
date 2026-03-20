/**
 * ═══════════════════════════════════════════════════════════════
 * REFRESH PSYCHIATRY — GA4 Auto-Pull Google Apps Script
 * ═══════════════════════════════════════════════════════════════
 *
 * HOW TO SET UP (one-time, ~10 minutes):
 *
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    Name it: "Refresh Psychiatry Analytics Data"
 *
 * 2. Rename the first sheet tab to: "MonthlyData"
 *
 * 3. In row 1, add these headers (A1 through H1):
 *    Month | Sessions | Organic | Paid | Social | Inquiries | AdSpend | ROAS
 *
 * 4. Go to Extensions → Apps Script
 *
 * 5. Delete everything in Code.gs and paste THIS ENTIRE FILE
 *
 * 6. Update the GA4_PROPERTY_ID below with your GA4 property ID
 *    (Find it in GA4: Admin → Property Settings → Property ID)
 *
 * 7. Click "Run" → select "pullGA4MonthlyData" → Authorize when prompted
 *    (You'll need to click "Advanced" → "Go to Refresh Analytics" to allow)
 *
 * 8. Set up daily auto-run:
 *    - Click the clock icon (Triggers) in the left sidebar
 *    - Click "+ Add Trigger"
 *    - Function: pullGA4MonthlyData
 *    - Event source: Time-driven
 *    - Type: Day timer
 *    - Time: 6am to 7am
 *    - Click Save
 *
 * 9. Publish the sheet:
 *    - Go back to the spreadsheet
 *    - File → Share → Publish to web
 *    - Select "MonthlyData" sheet and "CSV" format
 *    - Click Publish → Copy the URL
 *    - Give this URL to Claude to connect to your dashboard
 *
 * That's it! The script runs daily, pulls the last 12 months of GA4 data,
 * and your dashboard auto-reads it on every page load.
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════ CONFIGURATION — UPDATE THESE ═══════
const GA4_PROPERTY_ID = 'YOUR_GA4_PROPERTY_ID'; // e.g., '123456789'
const SHEET_NAME = 'MonthlyData';
const MONTHS_TO_PULL = 12;

// If you track ad spend in GA4 events, set the event name here.
// Otherwise, leave blank and manually update the AdSpend column
// (or use Google Ads scheduled export — see below)
const AD_SPEND_EVENT = ''; // e.g., 'purchase' or leave empty

// ═══════════════════════════════════════════

function pullGA4MonthlyData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found. Create it first!');
  }

  // Clear old data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
  }

  // Calculate date ranges for each month (last 12 months)
  const now = new Date();
  const monthNames = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];

  const results = [];

  for (let i = MONTHS_TO_PULL - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // last day of month

    // Don't pull future months
    if (startDate > now) continue;

    // If current month, end date is today
    const effectiveEnd = endDate > now ? now : endDate;

    const startStr = Utilities.formatDate(startDate, 'America/New_York', 'yyyy-MM-dd');
    const endStr = Utilities.formatDate(effectiveEnd, 'America/New_York', 'yyyy-MM-dd');
    const monthLabel = monthNames[startDate.getMonth()] + ' ' + startDate.getFullYear();

    try {
      // GA4 Data API request
      const request = AnalyticsData.Properties.runReport({
        dateRanges: [{ startDate: startStr, endDate: endStr }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'conversions' }
        ]
      }, 'properties/' + GA4_PROPERTY_ID);

      let totalSessions = 0;
      let organic = 0;
      let paid = 0;
      let social = 0;
      let totalConversions = 0;

      if (request.rows) {
        request.rows.forEach(function(row) {
          const channel = row.dimensionValues[0].value.toLowerCase();
          const sessions = parseInt(row.metricValues[0].value) || 0;
          const conversions = parseInt(row.metricValues[2].value) || 0;

          totalSessions += sessions;
          totalConversions += conversions;

          if (channel.includes('organic')) {
            organic += sessions;
          } else if (channel.includes('paid') || channel.includes('cpc') || channel.includes('ppc')) {
            paid += sessions;
          } else if (channel.includes('social') || channel.includes('facebook') || channel.includes('instagram')) {
            social += sessions;
          }
        });
      }

      results.push({
        month: monthLabel,
        sessions: totalSessions,
        organic: organic,
        paid: paid,
        social: social,
        inquiries: totalConversions, // Maps GA4 conversions to "inquiries"
        adSpend: 0,   // Will be filled by Google Ads export or manually
        roas: 0       // Will be calculated if adSpend is available
      });

    } catch (e) {
      Logger.log('Error pulling data for ' + monthLabel + ': ' + e.message);
      results.push({
        month: monthLabel,
        sessions: 0, organic: 0, paid: 0, social: 0,
        inquiries: 0, adSpend: 0, roas: 0
      });
    }
  }

  // Write results to sheet
  results.forEach(function(r, idx) {
    const row = idx + 2; // Row 1 is headers
    sheet.getRange(row, 1).setValue(r.month);
    sheet.getRange(row, 2).setValue(r.sessions);
    sheet.getRange(row, 3).setValue(r.organic);
    sheet.getRange(row, 4).setValue(r.paid);
    sheet.getRange(row, 5).setValue(r.social);
    sheet.getRange(row, 6).setValue(r.inquiries);
    sheet.getRange(row, 7).setValue(r.adSpend);
    sheet.getRange(row, 8).setValue(r.roas);
  });

  // Add timestamp
  sheet.getRange('J1').setValue('Last Updated');
  sheet.getRange('J2').setValue(new Date());

  Logger.log('Successfully pulled ' + results.length + ' months of GA4 data.');
}

/**
 * ═══════════════════════════════════════════
 * GOOGLE ADS — SCHEDULED EXPORT INSTRUCTIONS
 * ═══════════════════════════════════════════
 *
 * Google Ads can auto-export campaign data to your Sheet:
 *
 * 1. Go to ads.google.com → Reports
 * 2. Create a new report with columns:
 *    - Month, Cost, Impressions, Clicks, Conversions, Conv. value
 * 3. Click the "Schedule" button (calendar icon)
 * 4. Set frequency to "Monthly"
 * 5. Choose "Google Sheets" as the destination
 * 6. Select YOUR analytics spreadsheet
 * 7. Create a new tab called "GoogleAds"
 *
 * Then add this function to merge Ads data into MonthlyData:
 */

function mergeGoogleAdsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monthlySheet = ss.getSheetByName(SHEET_NAME);
  const adsSheet = ss.getSheetByName('GoogleAds');

  if (!adsSheet) {
    Logger.log('No GoogleAds sheet found. Set up Google Ads scheduled export first.');
    return;
  }

  const adsData = adsSheet.getDataRange().getValues();
  const monthlyData = monthlySheet.getDataRange().getValues();

  // Build a map of month → ad spend from Google Ads export
  const adsMap = {};
  for (let i = 1; i < adsData.length; i++) {
    const month = adsData[i][0]; // Assumes first column is month
    const spend = parseFloat(adsData[i][1]) || 0; // Assumes second column is cost
    const convValue = parseFloat(adsData[i][5]) || 0; // Conv. value
    adsMap[month] = { spend: spend, roas: spend > 0 ? (convValue / spend) : 0 };
  }

  // Update MonthlyData with ad spend and ROAS
  for (let i = 1; i < monthlyData.length; i++) {
    const monthLabel = monthlyData[i][0];
    if (adsMap[monthLabel]) {
      monthlySheet.getRange(i + 1, 7).setValue(adsMap[monthLabel].spend);  // AdSpend column
      monthlySheet.getRange(i + 1, 8).setValue(adsMap[monthLabel].roas);   // ROAS column
    }
  }

  Logger.log('Merged Google Ads data into MonthlyData.');
}

/**
 * Run both pulls in sequence — set this as your daily trigger
 */
function dailyFullPull() {
  pullGA4MonthlyData();
  Utilities.sleep(2000);
  mergeGoogleAdsData();
  Logger.log('Daily full pull complete at ' + new Date());
}

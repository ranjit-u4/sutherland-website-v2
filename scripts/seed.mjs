// Seeds `entries_v2` with 20 diverse rows.
// Usage: node scripts/seed.mjs        (no dev server needed)
//
// This writes straight to Supabase through lib/supabase.js rather than through
// the API, because the API deliberately offers no way to set created_at or
// previous_value by hand: POST always stamps "now" and nulls the history, and
// PUT always overwrites the history with the row's current values. Seeding
// directly is what lets the rows carry a realistic spread of dates and gives a
// few of them an earlier version for the auditor view to show.
//
// Rows are only inserted, never removed -- re-running adds another 20.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load .env.local into the environment before touching lib/supabase.js, which
// reads the keys lazily on first use.
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const { getSupabase, TABLE } = await import("../lib/supabase.js");

// severity and impact must be High / Medium / Low; category must be one of
// Basic / Silver / Gold / Platinum. Everything except agent_name may be absent.
const rows = [
  { daysAgo: 20, hour: 9,  agent_name: "Priya Raman",   customer_name: "Northwind Logistics", summary: "Billing portal rejects valid card",        description: "Customer attempted payment three times with a card that works elsewhere. Gateway returned a generic decline each time.", severity: "High",   impact: "High",   cost: 4200.00,  customer_category: "Gold" },
  { daysAgo: 19, hour: 14, agent_name: "Priya Raman",                                         summary: "Duplicate charge reported",                                                                                                                                                       severity: "Medium",                   cost: 189.50,   customer_category: "Basic" },
  { daysAgo: 18, hour: 11, agent_name: "Marcus Webb",   customer_name: "Cedar Point Dental",                                                       description: "Caller reported the scheduling tool timed out repeatedly during peak hours.",                                            severity: "Low",    impact: "Low",                    customer_category: "Silver" },
  { daysAgo: 17, hour: 16, agent_name: "Aisha Okonkwo", customer_name: "Halvorsen Freight",   summary: "Data export truncated at 500 rows",        description: "Compliance export silently stops at 500 records with no warning or error shown to the user.",                            severity: "High",   impact: "High",   cost: 18750.00, customer_category: "Platinum" },
  { daysAgo: 16, hour: 8,  agent_name: "Tomás Herrera", customer_name: "Brightline Medical",  summary: "Password reset email never arrives",       description: "Reset requests queue but never deliver. Suspect domain-level mail filtering.",                                           severity: "High",                     cost: 0,        customer_category: "Gold" },
  { daysAgo: 15, hour: 13, agent_name: "Lena Fischer" },
  { daysAgo: 14, hour: 10, agent_name: "Priya Raman",   customer_name: "Kestrel Analytics",   summary: "API rate limit hit without warning",       description: "No advance notice before throttling began; client had no visibility into remaining quota.",                              severity: "Medium", impact: "Medium", cost: 950.25,   customer_category: "Silver" },
  { daysAgo: 13, hour: 15, agent_name: "Marcus Webb",   customer_name: "Orchard & Vine",      summary: "Refund not reflected on statement",        description: "Refund processed on our side but customer statement still shows original amount after nine days.",                       severity: "Low",                      cost: 76.40,    customer_category: "Basic" },
  { daysAgo: 12, hour: 12, agent_name: "Aisha Okonkwo", customer_name: "Summit Ridge Bank",   summary: "MFA lockout after phone change",           description: "Customer replaced their device and cannot complete the second factor; recovery codes were never saved.",                  severity: "High",   impact: "High",                   customer_category: "Platinum" },
  { daysAgo: 11, hour: 17, agent_name: "Tomás Herrera",                                       summary: "Invoice PDF renders blank",                description: "PDF downloads at expected file size but every page is empty in two different readers.",                                 severity: "Medium", impact: "Low",    cost: 320 },
  { daysAgo: 10, hour: 9,  agent_name: "Lena Fischer",  customer_name: "Praxis Interiors",    summary: "Shipment tracking stuck in transit",                                                                                                                                               severity: "Low",    impact: "Low",                    customer_category: "Silver" },
  { daysAgo: 9,  hour: 14, agent_name: "Priya Raman",   customer_name: "Vantage Robotics",    summary: "Bulk upload corrupts accented characters", description: "Non-ASCII characters become mojibake on import. Encoding appears to be misread as Latin-1.",                            severity: "High",   impact: "Medium", cost: 6400.75,  customer_category: "Gold" },
  { daysAgo: 8,  hour: 11, agent_name: "Marcus Webb",   customer_name: "Lakeside Grocers",                                                         description: "Card reader at lane 4 disconnects intermittently, roughly twice an hour during busy periods.",                          severity: "Medium",                   cost: 1120,     customer_category: "Silver" },
  { daysAgo: 7,  hour: 16, agent_name: "Aisha Okonkwo", customer_name: "Fairhaven Trust",     summary: "Statement shows wrong currency symbol",    description: "Amounts are correct but display with a dollar sign instead of the account's pound denomination.",                        severity: "Low",    impact: "Low",    cost: 0,        customer_category: "Gold" },
  { daysAgo: 6,  hour: 10, agent_name: "Tomás Herrera", customer_name: "Delta Nine Studios",  summary: "Account merge lost historical tickets",     description: "Merging two accounts discarded the older account's ticket history rather than combining it.",                            severity: "High",   impact: "High",   cost: 24300,    customer_category: "Platinum" },
  { daysAgo: 5,  hour: 13, agent_name: "Lena Fischer",  customer_name: "Copperfield Realty",  summary: "Two-factor SMS delayed over 10 minutes",                                                                                                                                          severity: "Medium", impact: "Medium", cost: 480.60,   customer_category: "Basic" },
  { daysAgo: 4,  hour: 15, agent_name: "Priya Raman",                                         summary: "Webhook retries flooding endpoint",        description: "Failed deliveries retry without backoff, producing thousands of requests per hour.",                                     severity: "High",   impact: "High",   cost: 3075.50 },
  { daysAgo: 3,  hour: 12, agent_name: "Marcus Webb",   customer_name: "Ironwood Fitness",    summary: "Membership renewal charged twice",         description: "Annual renewal billed on consecutive days. One charge refunded during the call.",                                       severity: "Medium", impact: "Low",    cost: 129.99,   customer_category: "Basic" },
  { daysAgo: 2,  hour: 9,  agent_name: "Aisha Okonkwo", customer_name: "Beacon Health Group",                                                                                                                                                                                            severity: "High",   impact: "High",   cost: 51000,    customer_category: "Platinum" },
  { daysAgo: 1,  hour: 14, agent_name: "Tomás Herrera", customer_name: "Sable Creek Winery",  summary: "Discount code applies twice at checkout",   description: "Stacking the same promotional code halves the total. Reproduced on three test orders.",                                 severity: "Low",    impact: "Low",    cost: 245.80,   customer_category: "Silver" },
];

// Rows (by 1-based position) that get an earlier version, so the auditor view
// and the Previous Value field have something to show without editing first.
// Each is the same shape the update route writes: every editable field, as the
// record stood before its last change.
const HISTORY = {
  1: { severity: "Medium", impact: "Medium", cost: 1200.0, summary: "Card declined at checkout" },
  4: { severity: "Medium", impact: "High", cost: 9000.0, customer_category: "Gold" },
  15: { severity: "Medium", impact: "Medium", cost: 12000.0, summary: "Account merge dropped some tickets" },
};

const FIELD_NAMES = [
  "agent_name",
  "customer_name",
  "summary",
  "description",
  "severity",
  "impact",
  "cost",
  "customer_category",
];

function backdate({ daysAgo, hour }) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, (daysAgo * 7) % 60, 0, 0);
  return d.toISOString();
}

/** Full snapshot of a row, with the HISTORY overrides applied. */
function previousValueFor(row, position) {
  const overrides = HISTORY[position];
  if (!overrides) return null;

  const snapshot = {};
  for (const name of FIELD_NAMES) snapshot[name] = row[name] ?? null;
  return { ...snapshot, ...overrides };
}

const payload = rows.map(({ daysAgo, hour, ...row }, i) => {
  const record = {};
  for (const name of FIELD_NAMES) record[name] = row[name] ?? null;
  record.previous_value = previousValueFor(row, i + 1);
  record.created_at = backdate({ daysAgo, hour });
  return record;
});

const { data, error } = await getSupabase()
  .from(TABLE)
  .insert(payload)
  .select("id");

if (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exit(1);
}

console.log(`Inserted ${data.length}/${rows.length} rows into ${TABLE}.`);

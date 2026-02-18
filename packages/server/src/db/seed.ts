import Database from 'better-sqlite3';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(__dirname, '../../../../data/zoho.db');
const CSV_DIR = path.resolve(__dirname, '../../../..', process.env.CSV_DIR || 'csv-data');

if (fs.existsSync(DB_PATH)) {
  console.log('Database already exists at', DB_PATH);
  console.log('Delete data/zoho.db to re-seed.');
  process.exit(0);
}

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema definitions ---

const SCHEMAS: Record<string, string> = {
  departments: `CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT,
    isEnabled INTEGER,
    creatorId TEXT,
    createdTime TEXT,
    modifiedTime TEXT,
    status TEXT
  )`,
  agents: `CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    status TEXT,
    isConfirmed INTEGER,
    createdTime TEXT,
    role TEXT,
    profile TEXT
  )`,
  accounts: `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    ownerId TEXT,
    accountName TEXT,
    phone TEXT,
    email TEXT,
    fax TEXT,
    website TEXT,
    industry TEXT,
    annualRevenue TEXT,
    createdBy TEXT,
    modifiedBy TEXT,
    createdTime TEXT,
    modifiedTime TEXT,
    street TEXT,
    city TEXT,
    state TEXT,
    code TEXT,
    country TEXT,
    description TEXT,
    crmAccountId TEXT,
    layoutId TEXT
  )`,
  contacts: `CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    accountId TEXT,
    phone TEXT,
    mobile TEXT,
    title TEXT,
    ownerId TEXT,
    type TEXT,
    createdBy TEXT,
    modifiedBy TEXT,
    createdTime TEXT,
    modifiedTime TEXT,
    fullName TEXT,
    salutation TEXT,
    isEndUser INTEGER,
    street TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    description TEXT,
    twitter TEXT,
    facebook TEXT,
    crmContactId TEXT,
    secondaryEmail TEXT,
    potentialsRevenue TEXT,
    potentialsClosingDate TEXT,
    revenueReceived TEXT,
    customerSince TEXT,
    layoutId TEXT,
    language TEXT
  )`,
  tickets: `CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    departmentId TEXT,
    contactId TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    description TEXT,
    status TEXT,
    productId TEXT,
    assigneeId TEXT,
    createdBy TEXT,
    modifiedBy TEXT,
    createdTime TEXT,
    modifiedTime TEXT,
    ticketNumber TEXT,
    resolution TEXT,
    toAddress TEXT,
    customerResponseTime TEXT,
    threadCount INTEGER,
    accountId TEXT,
    dueDate TEXT,
    priority TEXT,
    channel TEXT,
    category TEXT,
    subCategory TEXT,
    closedTime TEXT,
    isEscalated INTEGER,
    classification TEXT,
    statusUpdatedTime TEXT,
    reopenedTime TEXT,
    assignedTime TEXT,
    firstAssignedTime TEXT,
    happinessRating TEXT,
    agentRespondedTime TEXT,
    commentCount INTEGER,
    responseDueDate TEXT,
    slaName TEXT,
    slaViolationType TEXT,
    teamId TEXT,
    tags TEXT,
    onholdTime TEXT,
    sentiment TEXT,
    layoutId TEXT,
    language TEXT,
    childTicketCount INTEGER,
    billableChange TEXT
  )`,
  threads: `CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    ticketId TEXT,
    createdTime TEXT,
    threadStatus TEXT,
    content TEXT,
    isPrivate INTEGER,
    fromEmailAddress TEXT,
    receipients TEXT,
    hasAttach INTEGER,
    threadType TEXT,
    timeZone TEXT,
    scheduledTime TEXT,
    isScheduleActive INTEGER,
    departmentId TEXT,
    layoutId TEXT,
    toDisplayName TEXT,
    ccDisplayName TEXT,
    bccDisplayName TEXT,
    isPresence INTEGER,
    nestedThreadId TEXT
  )`,
  comments: `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    comment TEXT,
    commentedBy TEXT,
    isPublic INTEGER,
    commentedTime TEXT,
    modifiedTime TEXT,
    entityId TEXT,
    moduleId TEXT
  )`,
  timeEntries: `CREATE TABLE IF NOT EXISTS timeEntries (
    id TEXT PRIMARY KEY,
    ownerId TEXT,
    requestChargeType TEXT,
    executedTime TEXT,
    agentCostPerHour TEXT,
    additionalCost TEXT,
    totalCost TEXT,
    description TEXT,
    requestId TEXT,
    createdBy TEXT,
    modifiedBy TEXT,
    createdTime TEXT,
    modifiedTime TEXT,
    secondsSpent INTEGER,
    isBillable INTEGER,
    layoutId TEXT,
    isPresence INTEGER
  )`
};

// Position-based column mappings: CSV column index → DB column name
// Row 0 = display names, Row 1 = API field names, data from Row 2+
const COLUMN_MAPS: Record<string, string[]> = {
  departments: ['id', 'name', 'isEnabled', 'creatorId', 'createdTime', 'modifiedTime', 'status'],
  agents: ['id', 'firstName', 'lastName', 'email', 'status', 'isConfirmed', 'createdTime', 'role', 'profile', '_isPortalUser', '_integrationService'],
  accounts: ['id', 'ownerId', 'accountName', 'phone', 'email', 'fax', 'website', 'industry', 'annualRevenue', 'createdBy', 'modifiedBy', 'createdTime', 'modifiedTime', 'street', 'city', 'state', 'code', 'country', 'description', 'crmAccountId', 'layoutId'],
  contacts: ['id', 'firstName', 'lastName', 'email', 'accountId', 'phone', 'mobile', 'title', 'ownerId', 'type', 'createdBy', 'modifiedBy', 'createdTime', 'modifiedTime', 'fullName', 'salutation', 'isEndUser', 'street', 'city', 'state', 'zip', 'country', 'description', 'twitter', 'facebook', 'crmContactId', 'secondaryEmail', 'potentialsRevenue', 'potentialsClosingDate', 'revenueReceived', 'customerSince', 'layoutId', 'language'],
  tickets: ['id', 'departmentId', 'contactId', 'email', 'phone', 'subject', 'description', 'status', 'productId', 'assigneeId', 'createdBy', 'modifiedBy', 'createdTime', 'modifiedTime', 'ticketNumber', 'resolution', 'toAddress', 'customerResponseTime', 'threadCount', 'accountId', 'dueDate', 'priority', 'channel', 'category', 'subCategory', 'closedTime', 'isEscalated', 'classification', 'statusUpdatedTime', 'reopenedTime', 'assignedTime', 'firstAssignedTime', 'happinessRating', 'agentRespondedTime', 'commentCount', 'responseDueDate', 'slaName', 'slaViolationType', 'teamId', 'tags', 'onholdTime', 'sentiment', 'layoutId', 'language', 'childTicketCount', 'billableChange'],
  threads: ['id', 'ticketId', 'createdTime', 'threadStatus', 'content', 'isPrivate', 'fromEmailAddress', 'receipients', 'hasAttach', 'threadType', 'timeZone', 'scheduledTime', 'isScheduleActive', 'departmentId', 'layoutId', 'toDisplayName', 'ccDisplayName', 'bccDisplayName', 'isPresence', 'nestedThreadId'],
  comments: ['id', 'comment', 'commentedBy', 'isPublic', 'commentedTime', 'modifiedTime', 'entityId', 'moduleId'],
  timeEntries: ['id', 'ownerId', 'requestChargeType', 'executedTime', 'agentCostPerHour', 'additionalCost', 'totalCost', 'description', 'requestId', 'createdBy', 'modifiedBy', 'createdTime', 'modifiedTime', 'secondsSpent', 'isBillable', 'layoutId', 'isPresence']
};

const CSV_TO_TABLE: Record<string, string> = {
  'Departments__1.csv': 'departments',
  'Agents__1.csv': 'agents',
  'Accounts__1.csv': 'accounts',
  'Contacts__1.csv': 'contacts',
  'Cases__1.csv': 'tickets',
  'Threads__1.csv': 'threads',
  'Comments__1.csv': 'comments',
  'TimeEntry__1.csv': 'timeEntries'
};

// Boolean fields that need conversion
const BOOLEAN_FIELDS = new Set([
  'isEnabled', 'isConfirmed', 'isEndUser', 'isPrivate', 'hasAttach',
  'isScheduleActive', 'isPresence', 'isPublic', 'isEscalated', 'isBillable'
]);

function toBool(val: string): number {
  if (!val) return 0;
  const lower = val.toLowerCase().trim();
  return lower === 'true' || lower === '1' ? 1 : 0;
}

function toInt(val: string): number | null {
  if (!val || val.trim() === '') return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

const INTEGER_FIELDS = new Set(['threadCount', 'commentCount', 'childTicketCount', 'secondsSpent']);

// --- Create tables ---
console.log('Creating tables...');
for (const [table, sql] of Object.entries(SCHEMAS)) {
  db.exec(sql);
  console.log(`  Created table: ${table}`);
}

// --- Parse and insert CSVs ---
function parseAndInsert(csvFile: string, tableName: string) {
  const csvPath = path.join(CSV_DIR, csvFile);
  if (!fs.existsSync(csvPath)) {
    console.log(`  Skipping ${csvFile} (not found)`);
    return 0;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const result = Papa.parse(content, {
    header: false,
    skipEmptyLines: true
  });

  const rows = result.data as string[][];
  // Skip row 0 (display names) and row 1 (API field names); data from row 2+
  const dataRows = rows.slice(2);
  const colMap = COLUMN_MAPS[tableName];

  if (!colMap) {
    console.log(`  No column map for ${tableName}, skipping`);
    return 0;
  }

  // Filter out columns starting with '_' (skipped)
  const dbCols = colMap.filter(c => !c.startsWith('_'));
  const colIndices = colMap.map((c, i) => ({ name: c, index: i })).filter(c => !c.name.startsWith('_'));

  const placeholders = dbCols.map(() => '?').join(', ');
  const insertSql = `INSERT OR IGNORE INTO ${tableName} (${dbCols.join(', ')}) VALUES (${placeholders})`;
  const stmt = db.prepare(insertSql);

  const insertMany = db.transaction((rows: string[][]) => {
    let count = 0;
    for (const row of rows) {
      if (!row[0] || row[0].trim() === '') continue; // skip empty ID rows

      const values = colIndices.map(({ name, index }) => {
        const val = index < row.length ? row[index] : '';
        if (BOOLEAN_FIELDS.has(name)) return toBool(val);
        if (INTEGER_FIELDS.has(name)) return toInt(val);
        return val || null;
      });

      try {
        stmt.run(...values);
        count++;
      } catch (err: any) {
        // Log but continue on individual row errors
        if (!err.message.includes('UNIQUE constraint')) {
          console.error(`  Error inserting into ${tableName}:`, err.message);
        }
      }
    }
    return count;
  });

  const count = insertMany(dataRows);
  return count;
}

console.log('\nImporting data...');
const counts: Record<string, number> = {};

// Import in dependency order
const importOrder = [
  'Departments__1.csv',
  'Agents__1.csv',
  'Accounts__1.csv',
  'Contacts__1.csv',
  'Cases__1.csv',
  'Comments__1.csv',
  'TimeEntry__1.csv',
  // Threads last (large, multiline)
  'Threads__1.csv'
];

for (const csvFile of importOrder) {
  const tableName = CSV_TO_TABLE[csvFile];
  if (!tableName) continue;
  const count = parseAndInsert(csvFile, tableName);
  counts[tableName] = count;
  console.log(`  ${tableName}: ${count} rows`);
}

// --- Create indices ---
console.log('\nCreating indices...');
const INDICES = [
  'CREATE INDEX IF NOT EXISTS idx_threads_ticketId ON threads(ticketId)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_assigneeId ON tickets(assigneeId)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_departmentId ON tickets(departmentId)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_contactId ON tickets(contactId)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_accountId ON tickets(accountId)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_createdTime ON tickets(createdTime)',
  'CREATE INDEX IF NOT EXISTS idx_comments_entityId ON comments(entityId)',
  'CREATE INDEX IF NOT EXISTS idx_contacts_accountId ON contacts(accountId)',
  'CREATE INDEX IF NOT EXISTS idx_timeEntries_requestId ON timeEntries(requestId)',
];

for (const idx of INDICES) {
  db.exec(idx);
}
console.log('  Indices created.');

console.log('\nSeed complete!');
console.log('Row counts:', counts);

db.close();

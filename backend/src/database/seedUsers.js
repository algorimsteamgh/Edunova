import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

// Adds a fixed set of student accounts. Every record is derived from SEED_KEY, so the same
// accounts (same ids, names and emails) come out on every run: applying again inserts only
// what is missing, and rollback removes exactly these accounts and nothing else.
//
// Emails use the reserved example.* domains (RFC 2606), so no message can ever reach a real inbox.
// Passwords are random per account and never stored or printed; nobody can sign in as these users.

const SEED_KEY = 'edunova-users-2026-11';
export const DEFAULT_TARGET = 1466;
const POOL_SIZE = 1700; // spare candidates to skip any that clash with an existing account

const FIRST_MALE = [
  'Aarav', 'Abhishek', 'Aditya', 'Ajay', 'Akash', 'Akhil', 'Amit', 'Anand', 'Anil', 'Ankit', 'Anurag', 'Arjun',
  'Arun', 'Ashok', 'Ashwin', 'Bharath', 'Chaitanya', 'Deepak', 'Dhruv', 'Dinesh', 'Gaurav', 'Gopal', 'Harish',
  'Harsha', 'Hemanth', 'Ishaan', 'Jagadeesh', 'Karan', 'Karthik', 'Kiran', 'Krishna', 'Kunal', 'Lokesh', 'Mahesh',
  'Manish', 'Manoj', 'Mohit', 'Murali', 'Naveen', 'Nikhil', 'Nitin', 'Pavan', 'Pradeep', 'Prakash', 'Pranav',
  'Prasanth', 'Praveen', 'Rahul', 'Rajesh', 'Rakesh', 'Ramesh', 'Ravi', 'Rohit', 'Sachin', 'Sai', 'Sandeep',
  'Sanjay', 'Santosh', 'Satish', 'Shankar', 'Shiva', 'Siddharth', 'Sridhar', 'Srinivas', 'Sudheer', 'Sumanth',
  'Suresh', 'Tarun', 'Teja', 'Uday', 'Varun', 'Venkat', 'Vignesh', 'Vijay', 'Vikram', 'Vinay', 'Vinod', 'Vishal',
  'Vivek', 'Yash', 'Yashwanth', 'Raghav', 'Dheeraj', 'Kartik', 'Mukesh', 'Pawan', 'Rajiv', 'Sameer', 'Srikanth',
];
const FIRST_FEMALE = [
  'Aarti', 'Aishwarya', 'Akshara', 'Amrutha', 'Ananya', 'Anjali', 'Ankita', 'Anusha', 'Aparna', 'Bhavana',
  'Bhavya', 'Chandana', 'Deepika', 'Divya', 'Gayathri', 'Harika', 'Haritha', 'Isha', 'Jahnavi', 'Jyothi',
  'Kavya', 'Keerthi', 'Kavitha', 'Lakshmi', 'Lavanya', 'Madhavi', 'Madhuri', 'Mamatha', 'Manasa', 'Meena',
  'Meghana', 'Monika', 'Mounika', 'Neha', 'Nikhila', 'Nisha', 'Pallavi', 'Pooja', 'Prathyusha', 'Preethi',
  'Priya', 'Priyanka', 'Radhika', 'Ramya', 'Rashmi', 'Renuka', 'Rithika', 'Sahithi', 'Sandhya', 'Sangeetha',
  'Sanjana', 'Saranya', 'Shalini', 'Shravya', 'Shreya', 'Shruthi', 'Sindhu', 'Sneha', 'Soumya', 'Sowmya',
  'Sravani', 'Sridevi', 'Supriya', 'Swathi', 'Swetha', 'Tejaswini', 'Vaishnavi', 'Varsha', 'Vidya', 'Vineetha',
  'Yamini', 'Harini', 'Nandini', 'Pavani', 'Revathi', 'Sushma', 'Tanvi', 'Urmila', 'Vasavi', 'Kriti',
];
// Weighted toward Andhra Pradesh / Telangana, with names from across India.
const SURNAMES = [
  'Reddy', 'Reddy', 'Rao', 'Rao', 'Naidu', 'Chowdary', 'Varma', 'Raju', 'Kumar', 'Kumar', 'Sharma', 'Sharma',
  'Gupta', 'Agarwal', 'Patel', 'Shah', 'Iyer', 'Iyengar', 'Nair', 'Menon', 'Pillai', 'Krishnan', 'Subramanian',
  'Venkatesh', 'Murthy', 'Prasad', 'Sastry', 'Bhat', 'Hegde', 'Shetty', 'Kulkarni', 'Deshpande', 'Joshi',
  'Patil', 'Jadhav', 'Pawar', 'Singh', 'Yadav', 'Mishra', 'Tiwari', 'Pandey', 'Srivastava', 'Verma', 'Saxena',
  'Chatterjee', 'Banerjee', 'Mukherjee', 'Das', 'Ghosh', 'Bose', 'Sen', 'Mehta', 'Desai', 'Malhotra', 'Kapoor',
  'Chopra', 'Arora', 'Bansal', 'Goyal', 'Jain', 'Mittal', 'Kaur', 'Gill', 'Sandhu', 'Thakur', 'Chauhan',
  'Rathod', 'Goud', 'Yadav', 'Achari', 'Gandham', 'Kandula', 'Bandaru', 'Kolli', 'Marella', 'Pothineni',
  'Vemuri', 'Chennupati', 'Nallamothu', 'Talluri', 'Ponnada', 'Yarlagadda', 'Bommareddy', 'Kancharla',
  'Gudivada', 'Mandava', 'Katta', 'Siripurapu', 'Dasari', 'Medisetti', 'Peddireddy', 'Kotha', 'Avula',
  'Mallela', 'Thota', 'Dogiparthi', 'Jonnalagadda', 'Ravuri', 'Alla', 'Kaza', 'Mutyala', 'Uppalapati',
];
const DOMAINS = ['example.com', 'example.in', 'example.org', 'example.net'];

// Deterministic random stream from the seed key.
function makeRng(label) {
  let counter = 0;
  let buffer = Buffer.alloc(0);
  return () => {
    if (buffer.length < 4) {
      buffer = crypto.createHash('sha256').update(`${SEED_KEY}:${label}:${counter++}`).digest();
    }
    const value = buffer.readUInt32BE(0) / 0x100000000;
    buffer = buffer.subarray(4);
    return value;
  };
}

function deterministicUuid(index) {
  const bytes = crypto.createHash('sha256').update(`${SEED_KEY}:id:${index}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4, same shape as crypto.randomUUID()
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const pick = (rng, list) => list[Math.floor(rng() * list.length)];

function makeEmail(rng, first, last) {
  const f = first.toLowerCase();
  const l = last.toLowerCase();
  const n2 = String(Math.floor(rng() * 90) + 10);
  const year = String(1988 + Math.floor(rng() * 20));
  const patterns = [
    () => `${f}.${l}`,
    () => `${f}${l}`,
    () => `${f}.${l}${n2}`,
    () => `${f}${n2}`,
    () => `${f[0]}${l}`,
    () => `${f}_${l}`,
    () => `${l}.${f}`,
    () => `${f}${year}`,
    () => `${f}.${l[0]}`,
    () => `${f}${l}${n2}`,
  ];
  return `${pick(rng, patterns)()}@${pick(rng, DOMAINS)}`;
}

// Sign-ups grow over time (more recent months are busier) and land mostly in Indian waking hours.
function makeCreatedAt(rng, startMs, endMs) {
  const t = Math.pow(rng(), 0.7);
  const day = new Date(startMs + t * (endMs - startMs));
  const istHourWeights = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 4, 4, 4, 4, 5, 5, 6, 7, 7, 6, 4, 2];
  const total = istHourWeights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  let istHour = 0;
  while (r >= istHourWeights[istHour]) r -= istHourWeights[istHour++];
  const utc = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), istHour, Math.floor(rng() * 60), Math.floor(rng() * 60), Math.floor(rng() * 1000));
  return Math.min(utc - 330 * 60 * 1000, endMs); // IST is UTC+5:30
}

// The full candidate list, identical on every run.
export function buildCandidates({ start = '2025-06-01T00:00:00Z', end = '2026-11-13T18:00:00Z' } = {}) {
  const rng = makeRng('people');
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  const usedNames = new Set();
  const usedEmails = new Set();
  const usedLocals = new Set();
  const people = [];

  for (let index = 0; people.length < POOL_SIZE; index++) {
    const female = rng() < 0.46;
    const first = pick(rng, female ? FIRST_FEMALE : FIRST_MALE);
    const last = pick(rng, SURNAMES);
    if (female && last === 'Singh') continue;
    if (!female && last === 'Kaur') continue;
    const fullName = `${first} ${last}`;
    const email = makeEmail(rng, first, last);
    const local = email.split('@')[0];
    // Sign-in also matches by full name or the part before '@', so all three must be unique.
    if (usedNames.has(fullName.toLowerCase()) || usedEmails.has(email) || usedLocals.has(local)) continue;
    usedNames.add(fullName.toLowerCase());
    usedEmails.add(email);
    usedLocals.add(local);

    const createdMs = makeCreatedAt(rng, startMs, endMs);
    // About 30% later changed a profile detail or password; about 2.5% are deactivated.
    const updatedMs = rng() < 0.3 ? Math.min(createdMs + rng() * (endMs - createdMs), endMs) : createdMs;
    const isActive = rng() < 0.975 ? 1 : 0;

    people.push({
      id: deterministicUuid(people.length),
      fullName,
      email,
      isActive,
      createdAt: new Date(createdMs).toISOString(),
      updatedAt: new Date(isActive ? updatedMs : Math.min(Math.max(updatedMs, createdMs + (1 + rng() * 60) * 86400000), endMs)).toISOString(),
    });
  }
  return people;
}

function clashesWithExisting(db, person) {
  const local = person.email.split('@')[0];
  return Boolean(
    db.prepare(`
      SELECT 1 FROM users
      WHERE id != ? AND (
        lower(email) = lower(?) OR lower(full_name) = lower(?) OR lower(full_name) = lower(?)
        OR lower(substr(email, 1, instr(email, '@') - 1)) = lower(?)
        OR lower(substr(email, 1, instr(email, '@') - 1)) = lower(?)
      )
    `).get(person.id, person.email, person.fullName, local, local, person.fullName)
  );
}

function presentIds(db, candidates) {
  const stmt = db.prepare('SELECT 1 FROM users WHERE id = ? AND email = ?');
  return candidates.filter((p) => stmt.get(p.id, p.email)).map((p) => p.id);
}

export async function applySeedUsers(db, { target = DEFAULT_TARGET, log = console.log } = {}) {
  const candidates = buildCandidates();
  const present = new Set(presentIds(db, candidates));
  const needed = target - present.size;
  if (needed <= 0) {
    log(`[Seed Users] ${present.size} of ${target} already present; nothing to do.`);
    return { inserted: 0, present: present.size };
  }

  const toInsert = [];
  for (const person of candidates) {
    if (toInsert.length === needed) break;
    if (present.has(person.id) || clashesWithExisting(db, person)) continue;
    toInsert.push(person);
  }
  if (toInsert.length < needed) {
    throw new Error(`Only ${toInsert.length} non-clashing candidates for ${needed} missing accounts`);
  }

  log(`[Seed Users] Hashing ${toInsert.length} passwords...`);
  for (const person of toInsert) {
    person.passwordHash = await bcrypt.hash(crypto.randomBytes(18).toString('base64url'), 10);
  }

  const insert = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'student', ?, ?, ?)
  `);
  db.transaction(() => {
    for (const p of toInsert) {
      // Re-check inside the transaction in case a real user registered while hashing.
      if (clashesWithExisting(db, p)) throw new Error(`Clash appeared during seeding for ${p.email}; run again`);
      insert.run(p.id, p.fullName, p.email, p.passwordHash, p.isActive, p.createdAt, p.updatedAt);
    }
  })();

  const total = presentIds(db, candidates).length;
  log(`[Seed Users] Inserted ${toInsert.length}; ${total} of ${target} now present.`);
  return { inserted: toInsert.length, present: total };
}

export function rollbackSeedUsers(db, { log = console.log } = {}) {
  const candidates = buildCandidates();
  const del = db.prepare("DELETE FROM users WHERE id = ? AND email = ? AND role = 'student'");
  let removed = 0;
  db.transaction(() => {
    for (const p of candidates) removed += del.run(p.id, p.email).changes;
  })();
  log(`[Seed Users] Rollback removed ${removed} accounts.`);
  return { removed };
}

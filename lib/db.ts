import { MongoClient, Db } from 'mongodb';

// Console colors for highlighting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

if (!process.env.MONGODB_URI) {
  console.error(
    `${colors.red}${colors.bright}❌ MongoDB:${colors.reset} ${colors.red}MONGODB_URI not found in environment variables${colors.reset}`
  );
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Initialize connection with logging
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log(
      `${colors.cyan}${colors.bright}🔄 MongoDB:${colors.reset} ${colors.cyan}Initializing connection...${colors.reset}`
    );
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((connectedClient) => {
        const dbName = connectedClient.db().databaseName;
        console.log(
          `${colors.green}${colors.bright}✅ MongoDB:${colors.reset} ${colors.green}Connected successfully to database "${dbName}"${colors.reset}`
        );
        return connectedClient;
      })
      .catch((error) => {
        console.error(
          `${colors.red}${colors.bright}❌ MongoDB:${colors.reset} ${colors.red}Connection failed: ${error.message}${colors.reset}`
        );
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log(
    `${colors.cyan}${colors.bright}🔄 MongoDB:${colors.reset} ${colors.cyan}Initializing connection (production)...${colors.reset}`
  );
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then((connectedClient) => {
      const dbName = connectedClient.db().databaseName;
      console.log(
        `${colors.green}${colors.bright}✅ MongoDB:${colors.reset} ${colors.green}Connected successfully to database "${dbName}"${colors.reset}`
      );
      return connectedClient;
    })
    .catch((error) => {
      console.error(
        `${colors.red}${colors.bright}❌ MongoDB:${colors.reset} ${colors.red}Connection failed: ${error.message}${colors.reset}`
      );
      throw error;
    });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get the database instance
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}


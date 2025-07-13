import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:AdMin-2025@cluster0.iooxltd.mongodb.net/";

const client = new MongoClient(uri);
let isConnected = false;

export const connectDB = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log("Connected to MongoDB -> Done");
    } catch (error) {
      console.error("Database Connection Error ->", error);
      throw error;
    }
  }
};

export const getTenantCollections = (tenantDbName) => {
  if (!isConnected) {
    throw new Error(
      "MongoDB client not connected yet. Call connectDB() first."
    );
  }
  const db = client.db(tenantDbName);
  return {
    // Existing collections
    stats: db.collection("stats"),
    companies: db.collection("companies"),

    // Admin dashboard collections
    employees: db.collection("employees"),
    projects: db.collection("projects"),
    clients: db.collection("clients"),
    tasks: db.collection("tasks"),
    attendance: db.collection("attendance"),
    departments: db.collection("departments"),
    leaves: db.collection("leaves"),
    leaveTypes: db.collection("leaveTypes"),
    invoices: db.collection("invoices"),
    activities: db.collection("activities"),
    todos: db.collection("todos"),
    schedules: db.collection("schedules"),
    birthdays: db.collection("birthdays"),
    jobApplications: db.collection("jobApplications"),
    earnings: db.collection("earnings"),
  };
};

export const getsuperadminCollections = () => {
  if (!isConnected) {
    throw new Error(
      "MongoDB client not connected yet. Call connectDB() first."
    );
  }
  const db = client.db("AmasQIS");
  return {
    stats: db.collection("stats"),
    companiesCollection: db.collection("companies"),
    packagesCollection: db.collection("packages"),
    subscriptionsCollection: db.collection("subscriptions"),
  };
};

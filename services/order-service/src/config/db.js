const mongoose = require('mongoose');

// Primary connection — for writes
let primaryConnection = null;

// Replica connection — for reads
let replicaConnection = null;

const connectDatabases = async () => {
  try {
    // ── Primary (writes) ──
    primaryConnection = await mongoose.createConnection(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    console.log('✅ Primary MongoDB connected (writes)');

    // ── Replica (reads) ──
    replicaConnection = await mongoose.createConnection(
      process.env.MONGO_READ_URI,
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        readPreference: 'secondary', // force reads to replica
      }
    );
    console.log('✅ Replica MongoDB connected (reads)');

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Falling back to primary for all operations');

    // Fallback — use primary for everything if replica is down
    if (!primaryConnection) {
      primaryConnection = await mongoose.createConnection(process.env.MONGO_URI);
    }
    replicaConnection = primaryConnection;
  }
};

const getPrimary = () => primaryConnection;
const getReplica = () => replicaConnection ?? primaryConnection;

module.exports = { connectDatabases, getPrimary, getReplica };
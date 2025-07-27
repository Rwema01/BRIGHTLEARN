// Lowdb setup for JSON database
const { Low, JSONFile } = require('lowdb');
const path = require('path');

const dbFile = path.join(__dirname, 'database.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data ||= {
    users: [],
    courses: [],
    enrollments: [],
    assignments: [],
    disciplinary: [],
    notifications: [],
    auditLogs: []
  };
  await db.write();
}

module.exports = { db, initDB };

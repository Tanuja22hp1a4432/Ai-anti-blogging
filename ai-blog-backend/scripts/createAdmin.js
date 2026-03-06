const bcrypt = require('bcryptjs');
const db = require('../database/db');
require('dotenv').config();

const [,, email, password, name] = process.argv;

if (!email || !password) {
  console.log('Usage: node scripts/createAdmin.js <email> <password> [name]');
  process.exit(1);
}

try {
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const stmt = db.prepare('INSERT INTO admin_users (email, password, name) VALUES (?, ?, ?)');
  stmt.run(email, hashedPassword, name || 'Admin');
  
  console.log(`✅ Admin user created: ${email}`);
} catch (err) {
  console.error('❌ Failed to create admin user:', err.message);
}

const db = require('../database/db');
const bcrypt = require('bcryptjs');

async function runSeeder() {
  console.log('🌱 Starting Database Seeder...');

  try {
    // 1. Clear existing admin users (optional, but good for a fresh seed)
    const deleteStmt = db.prepare('DELETE FROM admin_users');
    const resultDelete = deleteStmt.run();
    console.log(`🧹 Cleared ${resultDelete.changes} existing admin user(s).`);

    // 2. Prepare default admin credentials
    const defaultEmail = 'admin@ai-blog.com';
    const defaultPassword = 'admin123';
    const defaultName = 'Tanuja AI Admin';

    // 3. Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(defaultPassword, salt);

    // 4. Insert the new admin user
    const insertAdmin = db.prepare(
      'INSERT INTO admin_users (email, password, name) VALUES (?, ?, ?)'
    );
    
    insertAdmin.run(defaultEmail, hashedPassword, defaultName);
    
    console.log('✅ Admin user created successfully!\n');
    console.log('--------------------------------------------------');
    console.log('🔐 Login Credentials:');
    console.log(`✉️  Email:    ${defaultEmail}`);
    console.log(`🔑 Password: ${defaultPassword}`);
    console.log('--------------------------------------------------\n');
    console.log('🚀 Seeding complete. You can now login to the admin panel.');
  } catch (error) {
    console.error('❌ Error running seeder:', error);
    process.exit(1);
  }
}

runSeeder();

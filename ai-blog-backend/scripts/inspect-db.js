const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/blog.db');

try {
    const db = new Database(DB_PATH, { fileMustExist: true });
    
    console.log('\n=========================================');
    console.log('DATABASE TABLES');
    console.log('=========================================');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    
    if (tables.length === 0) {
        console.log('No tables found in the database.');
    } else {
        console.table(tables);
    }

    for (const table of tables) {
        console.log(`\n=========================================`);
        console.log(`DATA IN: ${table.name} (Limit 5)`);
        console.log(`=========================================`);
        const data = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
        if (data.length > 0) {
            console.table(data);
        } else {
            console.log('(Table is empty)');
        }
    }
    
    db.close();
} catch (error) {
    console.error('Error connecting to database:', error.message);
}

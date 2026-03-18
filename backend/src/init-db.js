const bcrypt = require('bcrypt');
const db = require('./db.js');

console.log("Reconstructing database...");

try {
    db.exec(`
        DROP TABLE IF EXISTS "products";
        DROP TABLE IF EXISTS "categories";
        DROP TABLE IF EXISTS "users";

        CREATE TABLE "categories" (
            "catid" INTEGER NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            PRIMARY KEY("catid")
        );

        CREATE TABLE "products" (
            "pid" INTEGER NOT NULL,
            "catid" INTEGER NOT NULL,
            "name" TEXT NOT NULL,
            "price" REAL NOT NULL,
            "description" TEXT,
            PRIMARY KEY("pid"),
            FOREIGN KEY("catid") REFERENCES "categories"("catid")
        );

        CREATE TABLE "users" (
            "userid" INTEGER,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "isAdmin" INTEGER DEFAULT 0,
            PRIMARY KEY("userid" AUTOINCREMENT)
        );
    `);

    console.log("Database tables reconstructed successfully!");

    const plainTextAdminPassword = 'admin';
    const saltRounds = 10;
    const hashedAdminPassword = bcrypt.hashSync(plainTextAdminPassword, saltRounds);
    const insertAdmin = db.prepare(`INSERT INTO users (email, password, isAdmin) VALUES (?, ?, ?)`);
    insertAdmin.run('admin@admin.com', hashedAdminPassword, 1);
    console.log("Default admin account created!");
    console.log("Email: admin@admin.com | Password: admin");
    const plainTextUserPassword = 'user';
    const hashedUserPassword = bcrypt.hashSync(plainTextUserPassword, saltRounds);
    const insertUser = db.prepare(`INSERT INTO users (email, password, isAdmin) VALUES (?, ?, ?)`);
    insertUser.run('user@user.com', hashedUserPassword, 0);
    console.log("Default user account created!");
    console.log("Email: user@user.com | Password: user");

} catch (err) {
    console.error("Error reconstructing database:", err.message);
}
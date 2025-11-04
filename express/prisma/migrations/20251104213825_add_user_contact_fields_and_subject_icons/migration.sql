/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,
    "xpLevel" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "profilePhoto" TEXT,
    "classroomAddress" TEXT,
    "onlineClassroomLink" TEXT,
    "contactData" TEXT
);
INSERT INTO "new_User" ("email", "firstName", "id", "lastName", "profilePhoto", "rating", "xpLevel") SELECT "email", "firstName", "id", "lastName", "profilePhoto", "rating", "xpLevel" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

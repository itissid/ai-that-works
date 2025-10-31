-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailNotificationFrequency" TEXT NOT NULL DEFAULT 'IMMEDIATE',
    "lastDigestSentAt" DATETIME,
    "digestIncludeTodoCreated" BOOLEAN NOT NULL DEFAULT true,
    "digestIncludeTodoUpdated" BOOLEAN NOT NULL DEFAULT true,
    "digestIncludeTodoDeleted" BOOLEAN NOT NULL DEFAULT true,
    "digestIncludeTodoCommented" BOOLEAN NOT NULL DEFAULT true,
    "digestIncludeTodoReacted" BOOLEAN NOT NULL DEFAULT true,
    "digestIncludeListShared" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailNotificationFrequency", "id", "lastDigestSentAt", "name", "updatedAt") SELECT "createdAt", "email", "emailNotificationFrequency", "id", "lastDigestSentAt", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

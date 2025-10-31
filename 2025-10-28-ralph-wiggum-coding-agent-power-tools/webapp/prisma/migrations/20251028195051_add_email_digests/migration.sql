-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastDigestSentAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "includedInDigest" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "todoId" TEXT,
    "listId" TEXT,
    "actorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("actorId", "createdAt", "id", "listId", "message", "read", "todoId", "type", "updatedAt", "userId") SELECT "actorId", "createdAt", "id", "listId", "message", "read", "todoId", "type", "updatedAt", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_todoId_idx" ON "Notification"("todoId");
CREATE INDEX "Notification_listId_idx" ON "Notification"("listId");
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

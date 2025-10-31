-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'NONE',
    "userId" TEXT NOT NULL,
    "listId" TEXT,
    "dueDate" DATETIME,
    "recurrencePattern" TEXT NOT NULL DEFAULT 'NONE',
    "recurrenceEndDate" DATETIME,
    "parentRecurringTodoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Todo_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Todo_parentRecurringTodoId_fkey" FOREIGN KEY ("parentRecurringTodoId") REFERENCES "Todo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("createdAt", "description", "dueDate", "id", "listId", "priority", "status", "title", "updatedAt", "userId") SELECT "createdAt", "description", "dueDate", "id", "listId", "priority", "status", "title", "updatedAt", "userId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");
CREATE INDEX "Todo_listId_idx" ON "Todo"("listId");
CREATE INDEX "Todo_parentRecurringTodoId_idx" ON "Todo"("parentRecurringTodoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

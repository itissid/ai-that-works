-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NONE',
    "recurrencePattern" TEXT NOT NULL DEFAULT 'NONE',
    "recurrenceType" TEXT NOT NULL DEFAULT 'SIMPLE',
    "recurrenceInterval" INTEGER,
    "recurrenceDaysOfWeek" TEXT,
    "recurrenceDayOfMonth" INTEGER,
    "recurrenceWeekOfMonth" INTEGER,
    "recurrenceMonthDay" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("createdAt", "description", "id", "name", "priority", "recurrencePattern", "title", "updatedAt", "userId") SELECT "createdAt", "description", "id", "name", "priority", "recurrencePattern", "title", "updatedAt", "userId" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE INDEX "Template_userId_idx" ON "Template"("userId");
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
    "recurrenceType" TEXT NOT NULL DEFAULT 'SIMPLE',
    "recurrenceInterval" INTEGER,
    "recurrenceDaysOfWeek" TEXT,
    "recurrenceDayOfMonth" INTEGER,
    "recurrenceWeekOfMonth" INTEGER,
    "recurrenceMonthDay" TEXT,
    "recurrenceEndDate" DATETIME,
    "parentRecurringTodoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Todo_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Todo_parentRecurringTodoId_fkey" FOREIGN KEY ("parentRecurringTodoId") REFERENCES "Todo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("createdAt", "description", "dueDate", "id", "listId", "parentRecurringTodoId", "priority", "recurrenceEndDate", "recurrencePattern", "status", "title", "updatedAt", "userId") SELECT "createdAt", "description", "dueDate", "id", "listId", "parentRecurringTodoId", "priority", "recurrenceEndDate", "recurrencePattern", "status", "title", "updatedAt", "userId" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");
CREATE INDEX "Todo_listId_idx" ON "Todo"("listId");
CREATE INDEX "Todo_parentRecurringTodoId_idx" ON "Todo"("parentRecurringTodoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "TodoDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todoId" TEXT NOT NULL,
    "dependsOnTodoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TodoDependency_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TodoDependency_dependsOnTodoId_fkey" FOREIGN KEY ("dependsOnTodoId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TodoDependency_todoId_idx" ON "TodoDependency"("todoId");

-- CreateIndex
CREATE INDEX "TodoDependency_dependsOnTodoId_idx" ON "TodoDependency"("dependsOnTodoId");

-- CreateIndex
CREATE UNIQUE INDEX "TodoDependency_todoId_dependsOnTodoId_key" ON "TodoDependency"("todoId", "dependsOnTodoId");

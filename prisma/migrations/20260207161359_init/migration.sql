-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cleanings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "cleaning_date" DATETIME NOT NULL,
    "cleaning_type" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cleanings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cleanings_cleaning_type_cleaning_date_idx" ON "cleanings"("cleaning_type", "cleaning_date" DESC);

-- CreateIndex
CREATE INDEX "cleanings_user_id_idx" ON "cleanings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cleanings_user_id_cleaning_date_cleaning_type_key" ON "cleanings"("user_id", "cleaning_date", "cleaning_type");

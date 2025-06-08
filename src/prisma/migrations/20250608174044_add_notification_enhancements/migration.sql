-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'RESERVATION_EXPIRED';
ALTER TYPE "NotificationType" ADD VALUE 'FINE_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'BOOK_RETURNED';
ALTER TYPE "NotificationType" ADD VALUE 'RENEWAL_SUCCESS';
ALTER TYPE "NotificationType" ADD VALUE 'RENEWAL_FAILED';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM_MAINTENANCE';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "metadata" TEXT;

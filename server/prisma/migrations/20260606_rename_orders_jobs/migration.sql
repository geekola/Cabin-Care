-- Rename tables: orders → bookings, order_checklists → booking_checklists
-- jobs → assignments, job_results → assignment_results, job_photos → assignment_photos
-- Rename enum: OrderStatus → BookingStatus, JobStatus → AssignmentStatus

-- 1. Rename enums
ALTER TYPE "OrderStatus" RENAME TO "BookingStatus";
ALTER TYPE "JobStatus" RENAME TO "AssignmentStatus";

-- 2. Rename tables
ALTER TABLE "orders" RENAME TO "bookings";
ALTER TABLE "order_checklists" RENAME TO "booking_checklists";
ALTER TABLE "jobs" RENAME TO "assignments";
ALTER TABLE "job_results" RENAME TO "assignment_results";
ALTER TABLE "job_photos" RENAME TO "assignment_photos";

-- 3. Rename foreign key columns
ALTER TABLE "booking_checklists" RENAME COLUMN "orderId" TO "bookingId";
ALTER TABLE "assignments" RENAME COLUMN "orderId" TO "bookingId";
ALTER TABLE "assignment_results" RENAME COLUMN "jobId" TO "assignmentId";
ALTER TABLE "assignment_photos" RENAME COLUMN "jobId" TO "assignmentId";
ALTER TABLE "assignment_photos" RENAME COLUMN "jobResultId" TO "assignmentResultId";
ALTER TABLE "repair_items" RENAME COLUMN "jobId" TO "assignmentId";

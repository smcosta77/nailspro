/*
  Warnings:

  - The primary key for the `AppointmentService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AppointmentService` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AppointmentService" DROP CONSTRAINT "AppointmentService_appointmentId_fkey";

-- DropIndex
DROP INDEX "public"."AppointmentService_appointmentId_serviceId_key";

-- AlterTable
ALTER TABLE "AppointmentService" DROP CONSTRAINT "AppointmentService_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "AppointmentService_pkey" PRIMARY KEY ("appointmentId", "serviceId");

-- AddForeignKey
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

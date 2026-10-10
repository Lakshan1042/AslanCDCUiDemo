-- AlterTable
ALTER TABLE `patients` ADD COLUMN `current_plan` TEXT NULL,
    ADD COLUMN `is_locked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `primary_concerns` TEXT NULL,
    ADD COLUMN `program` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `must_change_password` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `patient_therapist_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `therapist_id` INTEGER NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unassigned_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `patient_therapist_assignments_patient_id_therapist_id_is_act_idx`(`patient_id`, `therapist_id`, `is_active`),
    INDEX `patient_therapist_assignments_therapist_id_is_active_idx`(`therapist_id`, `is_active`),
    INDEX `patient_therapist_assignments_patient_id_is_active_idx`(`patient_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_code_sequences` (
    `year` INTEGER NOT NULL,
    `last_sequence` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`year`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patient_therapist_assignments` ADD CONSTRAINT `patient_therapist_assignments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_therapist_assignments` ADD CONSTRAINT `patient_therapist_assignments_therapist_id_fkey` FOREIGN KEY (`therapist_id`) REFERENCES `therapists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

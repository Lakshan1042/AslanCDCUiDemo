-- CreateTable
CREATE TABLE `therapist_attendance_corrections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attendance_id` INTEGER NOT NULL,
    `admin_user_id` INTEGER NOT NULL,
    `prev_status` ENUM('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE') NOT NULL,
    `new_status` ENUM('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE') NOT NULL,
    `prev_time` DATETIME(3) NULL,
    `new_time` DATETIME(3) NULL,
    `prev_reason` VARCHAR(500) NULL,
    `new_reason` VARCHAR(500) NULL,
    `correction_reason` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `therapist_attendance_corrections_attendance_id_idx`(`attendance_id`),
    INDEX `therapist_attendance_corrections_admin_user_id_idx`(`admin_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `therapist_attendance_corrections` ADD CONSTRAINT `therapist_attendance_corrections_attendance_id_fkey` FOREIGN KEY (`attendance_id`) REFERENCES `therapist_attendance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `therapist_attendance_corrections` ADD CONSTRAINT `therapist_attendance_corrections_admin_user_id_fkey` FOREIGN KEY (`admin_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

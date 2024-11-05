CREATE TABLE `answers` (
	`account` text,
	`session_id` text,
	`answer1` integer,
	`answer2` integer,
	`answer3` integer,
	`answer4` integer,
	`answer5` integer,
	`answer6` integer,
	`answer7` integer,
	`answer8` integer,
	`result` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`account`, `session_id`)
);
--> statement-breakpoint
CREATE INDEX `result_idx` ON `answers` (`result`);
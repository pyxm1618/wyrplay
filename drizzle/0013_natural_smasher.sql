CREATE TABLE "wyr_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"anonymous_voter_id" text NOT NULL,
	"selected_option" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wyr_votes_selected_option_check" CHECK ("wyr_votes"."selected_option" in ('A', 'B'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wyr_votes_question_voter_idx" ON "wyr_votes" USING btree ("question_id","anonymous_voter_id");
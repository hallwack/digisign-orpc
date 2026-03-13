ALTER TABLE "signatures" ADD COLUMN "rsa_signing_duration" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "eddsa_signing_duration" real DEFAULT 0 NOT NULL;
-- Migration: Make doctor specialization optional
-- This allows creating doctor accounts without requiring a specialization

ALTER TABLE doctors
ALTER COLUMN specialization DROP NOT NULL;

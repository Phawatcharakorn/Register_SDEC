-- ============================================================
-- Migration: 001_create_applications.sql
-- SDEC Student Application System – Kasetsart University Sriracha
-- ============================================================

-- Enable UUID generation (already available in Supabase by default)
-- create extension if not exists "pgcrypto";

-- ----------------------------------------------------------
-- Table: applications
-- ----------------------------------------------------------
create table if not exists public.applications (
  id              uuid          primary key default gen_random_uuid(),
  created_at      timestamptz   not null    default now(),

  -- Applicant info
  full_name       text          not null,
  student_id      text          not null unique,
  faculty         text          not null,
  major           text          not null,
  year            int2          not null check (year between 1 and 4),
  gpa             numeric(3,2)  not null check (gpa >= 0 and gpa <= 4),
  phone           text          not null,
  email           text          not null,
  motivation      text          not null,

  -- File URLs from Supabase Storage
  photo_url       text,
  resume_url      text,

  -- Admin fields
  status          text          not null default 'pending'
                                check (status in ('pending', 'approved', 'rejected')),
  admin_note      text
);

-- Index for common admin queries
create index if not exists applications_status_idx  on public.applications (status);
create index if not exists applications_created_idx on public.applications (created_at desc);

-- ----------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------
alter table public.applications enable row level security;

-- Public can INSERT (form submission – no auth required)
create policy "public_can_insert"
  on public.applications
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users (admins) can SELECT
create policy "admin_can_select"
  on public.applications
  for select
  to authenticated
  using (true);

-- Only authenticated users (admins) can UPDATE
create policy "admin_can_update"
  on public.applications
  for update
  to authenticated
  using (true)
  with check (true);

-- Admins can DELETE if needed
create policy "admin_can_delete"
  on public.applications
  for delete
  to authenticated
  using (true);

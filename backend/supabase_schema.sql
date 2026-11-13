-- ReportSaathi Supabase Database Schema
-- Run this in your Supabase Project SQL Editor to enable authenticated history

-- 1. Create table for user medical report history
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    patient_context TEXT,
    overall_overview TEXT,
    key_highlights JSONB DEFAULT '[]'::jsonb,
    questions_for_doctor JSONB DEFAULT '[]'::jsonb,
    findings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: users can only view, insert, and delete their own reports
CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
    ON public.reports FOR DELETE
    USING (auth.uid() = user_id);

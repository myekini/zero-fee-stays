-- Create calendar syncs table for iCal import/export
CREATE TABLE IF NOT EXISTS calendar_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Sync configuration
  sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('export', 'import')),
  external_calendar_url TEXT, -- For imports
  sync_frequency VARCHAR(20) DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  last_sync_status VARCHAR(20) CHECK (last_sync_status IN ('success', 'failed', 'pending')),
  sync_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(property_id, external_calendar_url)
);

-- Create calendar sync logs
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_sync_id UUID NOT NULL REFERENCES calendar_syncs(id) ON DELETE CASCADE,

  sync_started_at TIMESTAMPTZ DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
  events_synced INTEGER DEFAULT 0,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_syncs_property_id ON calendar_syncs(property_id);
CREATE INDEX idx_calendar_syncs_host_id ON calendar_syncs(host_id);
CREATE INDEX idx_calendar_syncs_active ON calendar_syncs(is_active) WHERE is_active = true;
CREATE INDEX idx_calendar_sync_logs_calendar_sync_id ON calendar_sync_logs(calendar_sync_id);

-- RLS Policies
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- Hosts can manage their own calendar syncs
CREATE POLICY "Hosts can manage their calendar syncs"
  ON calendar_syncs FOR ALL
  USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = host_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = host_id));

-- Hosts can view their sync logs
CREATE POLICY "Hosts can view their sync logs"
  ON calendar_sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_syncs
      WHERE id = calendar_sync_id
      AND host_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

COMMENT ON TABLE calendar_syncs IS 'Manages iCal calendar imports and exports for properties';
COMMENT ON TABLE calendar_sync_logs IS 'Logs of calendar synchronization activities';

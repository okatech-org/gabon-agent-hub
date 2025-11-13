-- Table pour stocker les alertes d'anomalies
CREATE TABLE IF NOT EXISTS public.iasted_anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('slow_response', 'high_error_rate', 'service_degradation')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  metric_name TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  actual_value NUMERIC NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index pour performances
CREATE INDEX idx_iasted_alerts_created_at ON public.iasted_anomaly_alerts(created_at DESC);
CREATE INDEX idx_iasted_alerts_severity ON public.iasted_anomaly_alerts(severity);
CREATE INDEX idx_iasted_alerts_acknowledged ON public.iasted_anomaly_alerts(acknowledged);

-- Enable RLS
ALTER TABLE public.iasted_anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view alerts for all users"
  ON public.iasted_anomaly_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "System can create alerts"
  ON public.iasted_anomaly_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can acknowledge alerts"
  ON public.iasted_anomaly_alerts
  FOR UPDATE
  USING (true);

-- Table pour stocker les statistiques agrégées
CREATE TABLE IF NOT EXISTS public.iasted_performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
  avg_response_time NUMERIC,
  p95_response_time NUMERIC,
  p99_response_time NUMERIC,
  total_requests INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_rate NUMERIC,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour performances
CREATE INDEX idx_iasted_stats_time_bucket ON public.iasted_performance_stats(time_bucket DESC);

-- Enable RLS
ALTER TABLE public.iasted_performance_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view stats"
  ON public.iasted_performance_stats
  FOR SELECT
  USING (true);

CREATE POLICY "System can create stats"
  ON public.iasted_performance_stats
  FOR INSERT
  WITH CHECK (true);

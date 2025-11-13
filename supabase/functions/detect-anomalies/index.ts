import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Seuils configurables pour la détection d'anomalies
const THRESHOLDS = {
  RESPONSE_TIME_WARNING: 3000, // 3 secondes
  RESPONSE_TIME_CRITICAL: 5000, // 5 secondes
  ERROR_RATE_WARNING: 0.1, // 10%
  ERROR_RATE_CRITICAL: 0.25, // 25%
  MIN_REQUESTS_FOR_ANALYSIS: 5
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Analyser les événements des dernières 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentEvents, error: eventsError } = await supabase
      .from('analytics_voice_events')
      .select('*')
      .gte('created_at', fiveMinutesAgo);

    if (eventsError) throw eventsError;

    if (!recentEvents || recentEvents.length < THRESHOLDS.MIN_REQUESTS_FOR_ANALYSIS) {
      return new Response(JSON.stringify({ 
        message: 'Not enough data for analysis',
        eventsCount: recentEvents?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculer les statistiques
    const responseTimes = recentEvents
      .filter(e => e.event_data?.totalDuration)
      .map(e => e.event_data.totalDuration);

    const errorEvents = recentEvents.filter(e => 
      e.event_type === 'error' || e.event_data?.error
    );

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const errorRate = recentEvents.length > 0
      ? errorEvents.length / recentEvents.length
      : 0;

    // Calculer percentiles
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    const p95ResponseTime = sortedTimes[p95Index] || 0;
    const p99ResponseTime = sortedTimes[p99Index] || 0;

    // Enregistrer les statistiques
    const now = new Date();
    const timeBucket = new Date(Math.floor(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000));

    await supabase.from('iasted_performance_stats').insert({
      time_bucket: timeBucket.toISOString(),
      avg_response_time: avgResponseTime,
      p95_response_time: p95ResponseTime,
      p99_response_time: p99ResponseTime,
      total_requests: recentEvents.length,
      error_count: errorEvents.length,
      error_rate: errorRate,
      success_count: recentEvents.length - errorEvents.length
    });

    const alerts = [];

    // Détection d'anomalies - Temps de réponse lent
    if (avgResponseTime > THRESHOLDS.RESPONSE_TIME_CRITICAL) {
      alerts.push({
        alert_type: 'slow_response',
        severity: 'critical',
        metric_name: 'avg_response_time',
        threshold_value: THRESHOLDS.RESPONSE_TIME_CRITICAL,
        actual_value: avgResponseTime,
        message: `Temps de réponse critique: ${Math.round(avgResponseTime)}ms (seuil: ${THRESHOLDS.RESPONSE_TIME_CRITICAL}ms)`,
        details: {
          p95: p95ResponseTime,
          p99: p99ResponseTime,
          sample_size: responseTimes.length
        }
      });
    } else if (avgResponseTime > THRESHOLDS.RESPONSE_TIME_WARNING) {
      alerts.push({
        alert_type: 'slow_response',
        severity: 'medium',
        metric_name: 'avg_response_time',
        threshold_value: THRESHOLDS.RESPONSE_TIME_WARNING,
        actual_value: avgResponseTime,
        message: `Temps de réponse élevé: ${Math.round(avgResponseTime)}ms (seuil: ${THRESHOLDS.RESPONSE_TIME_WARNING}ms)`,
        details: {
          p95: p95ResponseTime,
          p99: p99ResponseTime,
          sample_size: responseTimes.length
        }
      });
    }

    // Détection d'anomalies - Taux d'erreur élevé
    if (errorRate > THRESHOLDS.ERROR_RATE_CRITICAL) {
      alerts.push({
        alert_type: 'high_error_rate',
        severity: 'critical',
        metric_name: 'error_rate',
        threshold_value: THRESHOLDS.ERROR_RATE_CRITICAL,
        actual_value: errorRate,
        message: `Taux d'erreur critique: ${(errorRate * 100).toFixed(1)}% (seuil: ${THRESHOLDS.ERROR_RATE_CRITICAL * 100}%)`,
        details: {
          error_count: errorEvents.length,
          total_requests: recentEvents.length,
          error_types: errorEvents.map(e => e.event_data?.error || 'unknown')
        }
      });
    } else if (errorRate > THRESHOLDS.ERROR_RATE_WARNING) {
      alerts.push({
        alert_type: 'high_error_rate',
        severity: 'high',
        metric_name: 'error_rate',
        threshold_value: THRESHOLDS.ERROR_RATE_WARNING,
        actual_value: errorRate,
        message: `Taux d'erreur élevé: ${(errorRate * 100).toFixed(1)}% (seuil: ${THRESHOLDS.ERROR_RATE_WARNING * 100}%)`,
        details: {
          error_count: errorEvents.length,
          total_requests: recentEvents.length,
          error_types: errorEvents.map(e => e.event_data?.error || 'unknown')
        }
      });
    }

    // Dégradation du service (combinaison de problèmes)
    if (avgResponseTime > THRESHOLDS.RESPONSE_TIME_WARNING && errorRate > THRESHOLDS.ERROR_RATE_WARNING) {
      alerts.push({
        alert_type: 'service_degradation',
        severity: 'critical',
        metric_name: 'service_health',
        threshold_value: 0,
        actual_value: 0,
        message: 'Dégradation générale du service détectée',
        details: {
          avg_response_time: avgResponseTime,
          error_rate: errorRate,
          affected_requests: recentEvents.length
        }
      });
    }

    // Enregistrer les nouvelles alertes
    if (alerts.length > 0) {
      await supabase.from('iasted_anomaly_alerts').insert(alerts);
      console.log(`${alerts.length} anomalies détectées et enregistrées`);
    }

    return new Response(JSON.stringify({
      success: true,
      stats: {
        avgResponseTime,
        p95ResponseTime,
        p99ResponseTime,
        errorRate,
        totalRequests: recentEvents.length,
        errorCount: errorEvents.length
      },
      alerts: alerts.map(a => ({
        type: a.alert_type,
        severity: a.severity,
        message: a.message
      })),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error detecting anomalies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

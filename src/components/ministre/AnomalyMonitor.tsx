import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface AnomalyAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric_name: string;
  threshold_value: number;
  actual_value: number;
  message: string;
  details: any;
  acknowledged: boolean;
  created_at: string;
  resolved_at: string | null;
}

interface PerformanceStats {
  avg_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  total_requests: number;
  error_count: number;
  error_rate: number;
  success_count: number;
  time_bucket: string;
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300'
};

const severityIcons = {
  low: Activity,
  medium: Clock,
  high: AlertTriangle,
  critical: XCircle
};

export const AnomalyMonitor = () => {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-détecter les anomalies toutes les 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const detectAnomaliesBackground = async () => {
      try {
        await supabase.functions.invoke('detect-anomalies');
        queryClient.invalidateQueries({ queryKey: ['anomaly-alerts'] });
        queryClient.invalidateQueries({ queryKey: ['performance-stats'] });
      } catch (error) {
        console.error('Background anomaly detection failed:', error);
      }
    };

    // Exécuter immédiatement puis toutes les 5 minutes
    detectAnomaliesBackground();
    const interval = setInterval(detectAnomaliesBackground, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, queryClient]);

  // Récupérer les alertes actives
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['anomaly-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iasted_anomaly_alerts')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AnomalyAlert[];
    },
    refetchInterval: autoRefresh ? 30000 : false // Rafraîchir toutes les 30 secondes si activé
  });

  // Récupérer les statistiques récentes
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['performance-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iasted_performance_stats')
        .select('*')
        .order('time_bucket', { ascending: false })
        .limit(12); // Dernière heure (12 x 5 minutes)

      if (error) throw error;
      return data as PerformanceStats[];
    },
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Mutation pour acquitter une alerte
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('iasted_anomaly_alerts')
        .update({ 
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-alerts'] });
      toast.success('Alerte acquittée');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'acquittement: ' + error.message);
    }
  });

  // Déclencher l'analyse des anomalies
  const detectAnomalies = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('detect-anomalies');
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['anomaly-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['performance-stats'] });
      
      if (data.alerts && data.alerts.length > 0) {
        toast.warning(`${data.alerts.length} anomalie(s) détectée(s)`);
      } else {
        toast.success('Aucune anomalie détectée');
      }
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      toast.error('Erreur lors de la détection des anomalies');
    }
  };

  // Calculer les moyennes sur la dernière heure
  const hourlyAverage = stats && stats.length > 0 ? {
    avgResponseTime: stats.reduce((sum, s) => sum + (s.avg_response_time || 0), 0) / stats.length,
    errorRate: stats.reduce((sum, s) => sum + (s.error_rate || 0), 0) / stats.length,
    totalRequests: stats.reduce((sum, s) => sum + (s.total_requests || 0), 0)
  } : null;

  const unacknowledgedCount = alerts?.filter(a => !a.acknowledged).length || 0;
  const criticalCount = alerts?.filter(a => a.severity === 'critical' && !a.acknowledged).length || 0;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Surveillance des Anomalies</h2>
          <p className="text-muted-foreground">Détection automatique des problèmes de performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="auto-refresh" className="text-sm">
              Actualisation auto
            </label>
          </div>
          <Button onClick={detectAnomalies} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Analyser maintenant
          </Button>
        </div>
      </div>

      {/* Résumé des alertes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unacknowledgedCount}</div>
            <p className="text-xs text-muted-foreground">
              {criticalCount > 0 && (
                <span className="text-red-600 font-medium">
                  {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Réponse Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hourlyAverage ? Math.round(hourlyAverage.avgResponseTime) : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Dernière heure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Erreur</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hourlyAverage ? (hourlyAverage.errorRate * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {hourlyAverage?.totalRequests || 0} requêtes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes Récentes</CardTitle>
          <CardDescription>
            Anomalies détectées nécessitant une attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des alertes...
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune alerte active</p>
              <p className="text-sm text-muted-foreground">Le système fonctionne normalement</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const SeverityIcon = severityIcons[alert.severity];
                return (
                  <Alert
                    key={alert.id}
                    className={`${severityColors[alert.severity]} ${alert.acknowledged ? 'opacity-60' : ''}`}
                  >
                    <SeverityIcon className="h-4 w-4" />
                    <div className="flex items-start justify-between flex-1">
                      <div className="flex-1">
                        <AlertTitle className="flex items-center gap-2">
                          {alert.message}
                          <Badge variant="outline" className="ml-2">
                            {alert.alert_type.replace('_', ' ')}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription className="mt-2">
                          <div className="text-sm space-y-1">
                            <p>Valeur: {Math.round(alert.actual_value)}</p>
                            <p>Seuil: {Math.round(alert.threshold_value)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </AlertDescription>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                        >
                          Acquitter
                        </Button>
                      )}
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphique des performances (simplifié) */}
      {stats && stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendances des Performances</CardTitle>
            <CardDescription>Statistiques sur la dernière heure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Temps de réponse P95</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(stats[0]?.p95_response_time || 0)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Temps de réponse P99</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(stats[0]?.p99_response_time || 0)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Requêtes réussies</span>
                  <span className="text-sm text-muted-foreground">
                    {stats[0]?.success_count || 0} / {stats[0]?.total_requests || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

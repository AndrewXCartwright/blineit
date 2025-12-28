import { ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/BottomNav";
import { useApiUsageStats, useApiKeys, useApiRequestLogs } from "@/hooks/useDeveloperApi";

const DeveloperUsage = () => {
  const navigate = useNavigate();
  const { data: stats } = useApiUsageStats();
  const { data: keys } = useApiKeys();
  const { data: logs } = useApiRequestLogs();

  const usagePercent = stats ? (stats.requestsToday / stats.dailyLimit) * 100 : 0;

  // Calculate endpoint distribution from logs
  const endpointCounts = logs?.reduce((acc, log) => {
    const endpoint = log.endpoint.split("?")[0];
    acc[endpoint] = (acc[endpoint] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalLogs = logs?.length || 1;
  const topEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate status code distribution
  const statusCounts = logs?.reduce((acc, log) => {
    const category = Math.floor(log.status_code / 100);
    if (category === 2) acc.success++;
    else if (category === 4) acc.clientError++;
    else if (category === 5) acc.serverError++;
    return acc;
  }, { success: 0, clientError: 0, serverError: 0 }) || { success: 0, clientError: 0, serverError: 0 };

  const statusTotal = statusCounts.success + statusCounts.clientError + statusCounts.serverError || 1;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              API Usage
            </h1>
            <p className="text-sm text-muted-foreground">Monitor your API consumption</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats?.requestsToday?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Requests Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats?.dailyLimit?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Daily Limit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{usagePercent.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Used</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats?.avgLatency || 0}ms</p>
              <p className="text-sm text-muted-foreground">Avg Latency</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercent} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats?.requestsToday?.toLocaleString() || 0} used</span>
              <span>{((stats?.dailyLimit || 0) - (stats?.requestsToday || 0)).toLocaleString()} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* By Endpoint */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topEndpoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests logged yet</p>
            ) : (
              topEndpoints.map(([endpoint, count]) => {
                const percent = (count / totalLogs) * 100;
                return (
                  <div key={endpoint}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-xs truncate flex-1">{endpoint}</span>
                      <span className="text-muted-foreground ml-2">{percent.toFixed(0)}%</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* By API Key */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {keys?.filter((k) => k.is_active).map((key) => (
              <div key={key.id} className="flex justify-between text-sm">
                <span>{key.name}</span>
                <span className="text-muted-foreground">
                  {key.requests_today.toLocaleString()} reqs
                </span>
              </div>
            ))}
            {(!keys || keys.filter((k) => k.is_active).length === 0) && (
              <p className="text-sm text-muted-foreground">No active API keys</p>
            )}
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Response Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600">Success (2xx)</span>
                <span>{((statusCounts.success / statusTotal) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(statusCounts.success / statusTotal) * 100} className="h-2 bg-green-100 [&>div]:bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-amber-600">Client Error (4xx)</span>
                <span>{((statusCounts.clientError / statusTotal) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(statusCounts.clientError / statusTotal) * 100} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600">Server Error (5xx)</span>
                <span>{((statusCounts.serverError / statusTotal) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(statusCounts.serverError / statusTotal) * 100} className="h-2 bg-red-100 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">Need higher limits?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upgrade to Pro for 100,000 requests/day
            </p>
            <Button size="sm">View Plans</Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default DeveloperUsage;
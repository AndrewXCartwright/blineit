import { useState } from "react";
import { ArrowLeft, Key, BookOpen, Link, BarChart3, FlaskConical, Plus, Copy, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useApiKeys, useApiUsageStats, useWebhooks, useRevokeApiKey, useDeleteApiKey } from "@/hooks/useDeveloperApi";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const DeveloperPortal = () => {
  const navigate = useNavigate();
  const { data: apiKeys, isLoading: keysLoading } = useApiKeys();
  const { data: stats } = useApiUsageStats();
  const { data: webhooks } = useWebhooks();
  const revokeKey = useRevokeApiKey();
  const deleteKey = useDeleteApiKey();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const activeKeys = apiKeys?.filter((k) => k.is_active) || [];

  const handleRevoke = async () => {
    if (selectedKey) {
      await revokeKey.mutateAsync(selectedKey);
      setShowRevokeDialog(false);
      setSelectedKey(null);
    }
  };

  const copyKeyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    toast({ title: "Copied", description: "Key prefix copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background p-4 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">👨‍💻</span>
              Developer Portal
            </h1>
            <p className="text-sm text-muted-foreground">Build integrations with B-LINE-IT</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{stats?.activeKeys || 0}</p>
              <p className="text-xs text-muted-foreground">Active Keys</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{stats?.requestsThisMonth?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Requests (30d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{stats?.successRate || 100}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{stats?.activeWebhooks || 0}</p>
              <p className="text-xs text-muted-foreground">Webhooks</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Start */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create an API key</li>
              <li>Read the documentation</li>
              <li>Test in sandbox environment</li>
              <li>Go live with production</li>
            </ol>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => navigate("/developers/keys/create")}>
                <Plus className="h-4 w-4 mr-1" />
                Create API Key
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/developers/docs")}>
                <BookOpen className="h-4 w-4 mr-1" />
                View Docs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            variant="ghost"
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate("/developers/keys")}
          >
            <Key className="h-4 w-4 text-amber-500" />
            <span className="text-xs">Keys</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate("/developers/docs")}
          >
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-xs">Docs</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate("/developers/webhooks")}
          >
            <Link className="h-4 w-4 text-green-500" />
            <span className="text-xs">Webhooks</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate("/developers/usage")}
          >
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-xs">Usage</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-3 flex flex-col gap-1"
            onClick={() => navigate("/developers/sandbox")}
          >
            <FlaskConical className="h-4 w-4 text-orange-500" />
            <span className="text-xs">Sandbox</span>
          </Button>
        </div>

        {/* API Keys List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your API Keys</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/developers/keys/create")}>
              <Plus className="h-4 w-4 mr-1" />
              New Key
            </Button>
          </div>

          {keysLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 h-32" />
                </Card>
              ))}
            </div>
          ) : activeKeys.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Key className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No API keys yet</p>
                <Button className="mt-3" onClick={() => navigate("/developers/keys/create")}>
                  Create Your First Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{key.name}</span>
                      </div>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {key.key_prefix}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyKeyPrefix(key.key_prefix)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Badge variant="outline" className="text-xs">
                        {key.environment}
                      </Badge>
                      <span>•</span>
                      <span>
                        {key.permissions.some((p) => p.includes("write")) ? "Full Access" : "Read Only"}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Created: {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}</p>
                      <p>
                        Last used:{" "}
                        {key.last_used_at
                          ? formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })
                          : "Never"}
                      </p>
                      <p>
                        Requests today: {key.requests_today.toLocaleString()} / {stats?.dailyLimit?.toLocaleString() || "∞"}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/developers/keys/${key.id}`)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedKey(key.id);
                          setShowRevokeDialog(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Revoke API Key
            </DialogTitle>
            <DialogDescription>
              This will immediately deactivate the API key. Any applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revokeKey.isPending}>
              {revokeKey.isPending ? "Revoking..." : "Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default DeveloperPortal;
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Key, Copy, Eye, EyeOff, Trash2, Shield, Globe, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useApiKeys, useUpdateApiKey, useDeleteApiKey, ApiKey } from "@/hooks/useDeveloperApi";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

const DeveloperApiKeyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: apiKeys } = useApiKeys();
  const updateKey = useUpdateApiKey();
  const deleteKey = useDeleteApiKey();
  const [showKey, setShowKey] = useState(false);

  const apiKey = apiKeys?.find(k => k.id === id);

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">API Key Not Found</h3>
            <Button onClick={() => navigate("/developers/keys")}>Back to Keys</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleActive = () => {
    updateKey.mutate({ id: apiKey.id, updates: { is_active: !apiKey.is_active } });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      deleteKey.mutate(apiKey.id, {
        onSuccess: () => navigate("/developers/keys")
      });
    }
  };

  const permissions = (apiKey.permissions || []) as string[];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers/keys")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{apiKey.name}</h1>
            <p className="text-muted-foreground text-sm">{apiKey.key_prefix}...</p>
          </div>
          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
            {apiKey.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-3 py-2 rounded font-mono flex-1">
                {showKey ? apiKey.key_prefix + "••••••••••••••••" : "••••••••••••••••••••••••"}
              </code>
              <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey.key_prefix)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For security, the full key is only shown once when created. Store it securely.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Requests Today</span>
                <span>{apiKey.requests_today.toLocaleString()} / 10,000</span>
              </div>
              <Progress value={(apiKey.requests_today / 10000) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Requests This Month</span>
                <span>{apiKey.requests_this_month.toLocaleString()} / 300,000</span>
              </div>
              <Progress value={(apiKey.requests_this_month / 300000) * 100} className="h-2" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">{format(new Date(apiKey.created_at), "MMM d, yyyy")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Used</span>
                <p className="font-medium">
                  {apiKey.last_used_at 
                    ? formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <Badge key={perm} variant="default" className="text-xs">
                  {perm.replace(/_/g, " ").replace(/:/g, " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Environment & Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Environment</Label>
                <p className="text-sm text-muted-foreground capitalize">{apiKey.environment}</p>
              </div>
              <Badge variant={apiKey.environment === "production" ? "destructive" : "secondary"}>
                {apiKey.environment}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Rate Limit Tier</Label>
                <p className="text-sm text-muted-foreground capitalize">{apiKey.rate_limit_tier}</p>
              </div>
            </div>
            {apiKey.expires_at && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Expires
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(apiKey.expires_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this API key</p>
              </div>
              <Switch checked={apiKey.is_active} onCheckedChange={toggleActive} />
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Revoke API Key
        </Button>
      </div>
    </div>
  );
};

export default DeveloperApiKeyDetail;

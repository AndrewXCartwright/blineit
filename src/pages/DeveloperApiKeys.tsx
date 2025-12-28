import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Key, MoreVertical, Copy, Eye, EyeOff, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApiKeys, useDeleteApiKey } from "@/hooks/useDeveloperApi";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const DeveloperApiKeys = () => {
  const navigate = useNavigate();
  const { data: apiKeys, isLoading } = useApiKeys();
  const deleteKey = useDeleteApiKey();
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDelete = (keyId: string) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      deleteKey.mutate(keyId);
    }
  };

  const getEnvironmentColor = (env: string) => {
    return env === "production" ? "destructive" : "secondary";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">API Keys</h1>
            <p className="text-muted-foreground text-sm">Manage your API keys</p>
          </div>
        </div>

        <Button onClick={() => navigate("/developers/keys/create")} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New API Key
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-32" />
              </Card>
            ))}
          </div>
        ) : apiKeys?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No API Keys</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first API key to start integrating with the platform.
              </p>
              <Button onClick={() => navigate("/developers/keys/create")}>
                Create API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apiKeys?.map((key) => (
              <Card key={key.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{key.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/developers/keys/${key.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/developers/keys/${key.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(key.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono flex-1 overflow-hidden">
                      {visibleKeys[key.id] ? key.key_prefix + "..." : "••••••••••••••••"}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => toggleKeyVisibility(key.id)}
                    >
                      {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(key.key_prefix)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getEnvironmentColor(key.environment)}>
                      {key.environment}
                    </Badge>
                    <Badge variant="outline">{key.rate_limit_tier}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Requests today</span>
                      <span>{key.requests_today.toLocaleString()} / 10,000</span>
                    </div>
                    <Progress value={(key.requests_today / 10000) * 100} className="h-2" />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <span>Created {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}</span>
                    {key.last_used_at && (
                      <span>Last used {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperApiKeys;

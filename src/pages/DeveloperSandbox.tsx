import { useState } from "react";
import { ArrowLeft, FlaskConical, Play, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BottomNav } from "@/components/BottomNav";
import { useApiKeys } from "@/hooks/useDeveloperApi";
import { toast } from "@/hooks/use-toast";

const SAMPLE_RESPONSES: Record<string, unknown> = {
  "/v2/portfolio": {
    success: true,
    data: {
      holdings: [
        {
          id: "sandbox_prop_001",
          type: "property",
          name: "Sunset Apartments",
          tokens: 100.0,
          cost_basis: 5000.0,
          current_value: 5250.0,
          current_price: 52.5,
          apy: 8.2,
        },
        {
          id: "sandbox_prop_002",
          type: "property",
          name: "Downtown Plaza",
          tokens: 50.0,
          cost_basis: 2500.0,
          current_value: 2650.0,
          current_price: 53.0,
          apy: 7.5,
        },
      ],
      total_value: 7900.0,
      total_cost_basis: 7500.0,
    },
    meta: { request_id: "req_sandbox_001", timestamp: new Date().toISOString() },
  },
  "/v2/portfolio/balance": {
    success: true,
    data: { wallet_balance: 1500.0, available_balance: 1500.0, pending_balance: 0 },
    meta: { request_id: "req_sandbox_002", timestamp: new Date().toISOString() },
  },
  "/v2/properties": {
    success: true,
    data: {
      properties: [
        { id: "prop_001", name: "Sunset Apartments", token_price: 52.5, apy: 8.2, city: "Austin", state: "TX" },
        { id: "prop_002", name: "Downtown Plaza", token_price: 53.0, apy: 7.5, city: "Denver", state: "CO" },
        { id: "prop_003", name: "Harbor View", token_price: 48.0, apy: 9.1, city: "Miami", state: "FL" },
      ],
      total: 3,
    },
    meta: { request_id: "req_sandbox_003", timestamp: new Date().toISOString() },
  },
};

const DeveloperSandbox = () => {
  const navigate = useNavigate();
  const { data: apiKeys } = useApiKeys();

  const [selectedKey, setSelectedKey] = useState("");
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/v2/portfolio");
  const [headers, setHeaders] = useState("Content-Type: application/json");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<{ status: number; data: unknown; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sandboxKeys = apiKeys?.filter((k) => k.environment === "sandbox" && k.is_active) || [];

  const sendRequest = async () => {
    if (!selectedKey) {
      toast({ title: "Error", description: "Please select an API key.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    // Simulate API call with fake data
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    const sampleResponse = SAMPLE_RESPONSES[endpoint] || {
      success: true,
      data: { message: "Sandbox response for " + endpoint },
      meta: { request_id: "req_sandbox_" + Date.now(), timestamp: new Date().toISOString() },
    };

    setResponse({
      status: 200,
      data: sampleResponse,
      time: Date.now() - startTime,
    });
    setLoading(false);
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      toast({ title: "Copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              <FlaskConical className="h-5 w-5 text-orange-500" />
              API Sandbox
            </h1>
            <p className="text-sm text-muted-foreground">Test API calls with sandbox data</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* API Key Selection */}
        <div className="space-y-2">
          <Label>API Key</Label>
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sandbox API key" />
            </SelectTrigger>
            <SelectContent>
              {sandboxKeys.length === 0 ? (
                <SelectItem value="none" disabled>
                  No sandbox keys found
                </SelectItem>
              ) : (
                sandboxKeys.map((key) => (
                  <SelectItem key={key.id} value={key.id}>
                    {key.name} ({key.key_prefix})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {sandboxKeys.length === 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => navigate("/developers/keys/create")}
            >
              Create a sandbox API key first
            </Button>
          )}
        </div>

        {/* Request Builder */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/v2/portfolio"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Headers</Label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder="Content-Type: application/json"
                className="font-mono text-xs h-16"
              />
            </div>

            {(method === "POST" || method === "PUT") && (
              <div className="space-y-1">
                <Label className="text-xs">Body (JSON)</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"amount": 100}'
                  className="font-mono text-xs h-24"
                />
              </div>
            )}

            <Button className="w-full" onClick={sendRequest} disabled={loading || !selectedKey}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Response */}
        {response && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Response</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={response.status < 400 ? "default" : "destructive"}
                    className={response.status < 400 ? "bg-green-500" : ""}
                  >
                    {response.status} OK
                  </Badge>
                  <span className="text-xs text-muted-foreground">{response.time}ms</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyResponse}>
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-80">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Quick Endpoints */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Test Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { method: "GET", path: "/v2/portfolio" },
              { method: "GET", path: "/v2/portfolio/balance" },
              { method: "GET", path: "/v2/properties" },
            ].map((ep) => (
              <Button
                key={ep.path}
                variant="outline"
                size="sm"
                className="w-full justify-start font-mono text-xs"
                onClick={() => {
                  setMethod(ep.method);
                  setEndpoint(ep.path);
                }}
              >
                <Badge variant="outline" className="mr-2 text-xs">
                  {ep.method}
                </Badge>
                {ep.path}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default DeveloperSandbox;
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const endpoints: Record<string, {
  method: string;
  path: string;
  title: string;
  description: string;
  permission: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  exampleRequest: string;
  exampleResponse: string;
}> = {
  "portfolio": {
    method: "GET",
    path: "/v2/portfolio",
    title: "Get Portfolio",
    description: "Retrieve the authenticated user's portfolio holdings including properties, loans, and prediction positions.",
    permission: "portfolio:read",
    parameters: [
      { name: "type", type: "string", required: false, description: "Filter by asset type: property, loan, prediction" },
      { name: "page", type: "integer", required: false, description: "Page number for pagination (default: 1)" },
      { name: "limit", type: "integer", required: false, description: "Items per page, max 100 (default: 50)" },
    ],
    exampleRequest: `curl -X GET \\
  "https://api.blineit.com/v2/portfolio?type=property" \\
  -H "Authorization: Bearer blit_prod_sk_..."`,
    exampleResponse: `{
  "success": true,
  "data": {
    "holdings": [
      {
        "id": "abc123",
        "type": "property",
        "name": "Sunset Apartments",
        "tokens": 50.27,
        "cost_basis": 5847.23,
        "current_value": 6258.62,
        "current_price": 124.50,
        "unrealized_gain": 411.39,
        "unrealized_gain_percent": 7.03,
        "apy": 8.2
      }
    ],
    "total_value": 15234.56,
    "total_cost_basis": 14200.00
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "request_id": "req_xyz789"
  }
}`,
  },
  "properties": {
    method: "GET",
    path: "/v2/properties",
    title: "List Properties",
    description: "Get a list of all available properties on the platform.",
    permission: "properties:read",
    parameters: [
      { name: "category", type: "string", required: false, description: "Filter by category: residential, commercial, mixed" },
      { name: "state", type: "string", required: false, description: "Filter by state code (e.g., TX, CA)" },
      { name: "min_apy", type: "number", required: false, description: "Minimum APY filter" },
      { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
      { name: "limit", type: "integer", required: false, description: "Items per page (default: 50)" },
    ],
    exampleRequest: `curl -X GET \\
  "https://api.blineit.com/v2/properties?category=residential" \\
  -H "Authorization: Bearer blit_prod_sk_..."`,
    exampleResponse: `{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "prop_123",
        "name": "Sunset Apartments",
        "address": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "category": "residential",
        "value": 2500000,
        "token_price": 50.00,
        "total_tokens": 50000,
        "apy": 8.2,
        "occupancy": 95
      }
    ]
  },
  "meta": {
    "page": 1,
    "total": 24
  }
}`,
  },
};

const DeveloperEndpointDoc = () => {
  const navigate = useNavigate();
  const { endpoint } = useParams();
  
  const doc = endpoint ? endpoints[endpoint] : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (!doc) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="font-semibold mb-2">Endpoint Not Found</h3>
            <Button onClick={() => navigate("/developers/docs")}>Back to Docs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const methodColor = {
    GET: "bg-green-500",
    POST: "bg-blue-500",
    PUT: "bg-yellow-500",
    DELETE: "bg-red-500",
  }[doc.method] || "bg-gray-500";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers/docs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge className={methodColor}>{doc.method}</Badge>
              <code className="text-sm font-mono">{doc.path}</code>
            </div>
            <h1 className="text-2xl font-bold mt-1">{doc.title}</h1>
          </div>
        </div>

        <p className="text-muted-foreground">{doc.description}</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Authorization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{doc.permission}</Badge>
          </CardContent>
        </Card>

        {doc.parameters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doc.parameters.map((param) => (
                  <div key={param.name} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold">{param.name}</code>
                        <Badge variant="secondary" className="text-xs">{param.type}</Badge>
                        {param.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Example Request
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(doc.exampleRequest)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/developers/sandbox")}>
                  <Play className="h-4 w-4 mr-1" />
                  Try It
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg font-mono overflow-x-auto">
              {doc.exampleRequest}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Example Response
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(doc.exampleResponse)}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg font-mono overflow-x-auto">
              {doc.exampleResponse}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperEndpointDoc;

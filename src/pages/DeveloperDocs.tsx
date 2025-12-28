import { useState } from "react";
import { ArrowLeft, BookOpen, Search, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

const endpoints = [
  {
    category: "Portfolio",
    items: [
      { method: "GET", path: "/v2/portfolio", desc: "Get user holdings" },
      { method: "GET", path: "/v2/portfolio/balance", desc: "Get wallet balance" },
      { method: "GET", path: "/v2/transactions", desc: "List transactions" },
    ],
  },
  {
    category: "Properties",
    items: [
      { method: "GET", path: "/v2/properties", desc: "List all properties" },
      { method: "GET", path: "/v2/properties/:id", desc: "Get property details" },
      { method: "GET", path: "/v2/properties/:id/dividends", desc: "Get dividend history" },
    ],
  },
  {
    category: "Loans",
    items: [
      { method: "GET", path: "/v2/loans", desc: "List all loans" },
      { method: "GET", path: "/v2/loans/:id", desc: "Get loan details" },
      { method: "POST", path: "/v2/loans/:id/invest", desc: "Invest in loan" },
    ],
  },
  {
    category: "Market",
    items: [
      { method: "GET", path: "/v2/market/listings", desc: "Get active listings" },
      { method: "GET", path: "/v2/market/:itemId/orderbook", desc: "Get order book" },
      { method: "POST", path: "/v2/market/orders", desc: "Place order" },
      { method: "DELETE", path: "/v2/market/orders/:id", desc: "Cancel order" },
    ],
  },
  {
    category: "Predictions",
    items: [
      { method: "GET", path: "/v2/predictions", desc: "List prediction markets" },
      { method: "GET", path: "/v2/predictions/:id", desc: "Get market details" },
      { method: "POST", path: "/v2/predictions/:id/bet", desc: "Place bet" },
    ],
  },
];

const DeveloperDocs = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Portfolio");

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast({ title: "Copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredEndpoints = endpoints.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.path.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  const methodColors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-600",
    POST: "bg-blue-500/10 text-blue-600",
    PUT: "bg-amber-500/10 text-amber-600",
    DELETE: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              API Documentation
            </h1>
            <Badge variant="outline" className="mt-1">v2.0</Badge>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Getting Started */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold">Getting Started</h2>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground mb-2">
                All API requests require authentication using an API key in the header:
              </p>
              <div className="relative">
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`curl -X GET \\
  https://api.blineit.com/v2/portfolio \\
  -H "Authorization: Bearer blit_prod_sk_..."`}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => copyCode(`curl -X GET https://api.blineit.com/v2/portfolio -H "Authorization: Bearer YOUR_API_KEY"`, "auth")}
                >
                  {copied === "auth" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Base URLs</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Production:</strong>{" "}
                  <code className="bg-muted px-1 rounded">https://api.blineit.com/v2</code>
                </p>
                <p>
                  <strong>Sandbox:</strong>{" "}
                  <code className="bg-muted px-1 rounded">https://sandbox.blineit.com/api/v2</code>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Response Format</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2024-12-28T12:00:00Z"
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Rate Limits</h3>
              <p className="text-sm text-muted-foreground">
                Rate limit info is included in response headers:
              </p>
              <pre className="text-xs bg-muted p-3 rounded mt-2">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-3">
          <h2 className="font-semibold">Endpoints</h2>
          
          {filteredEndpoints.map((category) => (
            <Card key={category.category}>
              <CardContent className="p-0">
                <button
                  className="w-full p-4 text-left font-medium flex items-center justify-between"
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.category ? null : category.category
                  )}
                >
                  {category.category}
                  <span>{expandedCategory === category.category ? "▼" : "▶"}</span>
                </button>
                
                {expandedCategory === category.category && (
                  <div className="border-t divide-y">
                    {category.items.map((item) => (
                      <div key={item.path} className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${methodColors[item.method]} text-xs font-mono`}>
                            {item.method}
                          </Badge>
                          <code className="text-sm font-mono">{item.path}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Codes */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold">Error Codes</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <code className="bg-muted px-1 rounded">400</code>
                <span className="text-muted-foreground">Bad Request - Invalid parameters</span>
              </div>
              <div className="flex justify-between">
                <code className="bg-muted px-1 rounded">401</code>
                <span className="text-muted-foreground">Unauthorized - Invalid API key</span>
              </div>
              <div className="flex justify-between">
                <code className="bg-muted px-1 rounded">403</code>
                <span className="text-muted-foreground">Forbidden - Insufficient permissions</span>
              </div>
              <div className="flex justify-between">
                <code className="bg-muted px-1 rounded">404</code>
                <span className="text-muted-foreground">Not Found - Resource doesn't exist</span>
              </div>
              <div className="flex justify-between">
                <code className="bg-muted px-1 rounded">429</code>
                <span className="text-muted-foreground">Rate Limited - Too many requests</span>
              </div>
              <div className="flex justify-between">
                <code className="bg-muted px-1 rounded">500</code>
                <span className="text-muted-foreground">Server Error - Something went wrong</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default DeveloperDocs;
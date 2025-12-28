import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Bug, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const changelog = [
  {
    version: "v2.1.0",
    date: "December 20, 2024",
    changes: [
      { type: "feature", text: "Added GET /v2/market/{id}/depth endpoint" },
      { type: "feature", text: "Added webhook event: prediction.resolved" },
      { type: "feature", text: "Added pagination to all list endpoints" },
      { type: "fix", text: "Fixed rate limit headers not included in responses" },
      { type: "fix", text: "Fixed timestamp format in webhook payloads" },
    ],
  },
  {
    version: "v2.0.0",
    date: "December 1, 2024",
    major: true,
    changes: [
      { type: "feature", text: "Complete API redesign" },
      { type: "feature", text: "New authentication system with API keys" },
      { type: "feature", text: "Webhook support for real-time notifications" },
      { type: "feature", text: "Sandbox environment for testing" },
      { type: "breaking", text: "All endpoints moved to /v2 prefix" },
      { type: "breaking", text: "New API key format (blit_*)" },
      { type: "breaking", text: "Response format standardized" },
    ],
  },
  {
    version: "v1.5.0",
    date: "November 15, 2024",
    changes: [
      { type: "feature", text: "Added prediction markets endpoints" },
      { type: "feature", text: "Added secondary market order book" },
      { type: "fix", text: "Fixed portfolio valuation calculation" },
    ],
  },
  {
    version: "v1.4.0",
    date: "October 28, 2024",
    changes: [
      { type: "feature", text: "Added loan investment endpoints" },
      { type: "feature", text: "Added dividend history endpoint" },
      { type: "fix", text: "Fixed pagination offset calculation" },
    ],
  },
  {
    version: "v1.3.0",
    date: "October 10, 2024",
    changes: [
      { type: "feature", text: "Added property detail endpoint" },
      { type: "feature", text: "Added holdings breakdown" },
      { type: "fix", text: "Fixed authentication token refresh" },
    ],
  },
];

const DeveloperChangelog = () => {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="h-4 w-4 text-primary" />;
      case "fix":
        return <Bug className="h-4 w-4 text-green-500" />;
      case "breaking":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "New";
      case "fix":
        return "Fix";
      case "breaking":
        return "Breaking";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">API Changelog</h1>
            <p className="text-muted-foreground text-sm">Version history and updates</p>
          </div>
        </div>

        <div className="space-y-4">
          {changelog.map((release) => (
            <Card key={release.version}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {release.version}
                    {release.major && <Badge variant="destructive">Major</Badge>}
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {release.date}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {getIcon(change.type)}
                      <Badge 
                        variant={change.type === "breaking" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {getLabel(change.type)}
                      </Badge>
                      <span className="text-sm">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperChangelog;

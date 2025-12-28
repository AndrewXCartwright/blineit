import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const sdks = [
  {
    id: "javascript",
    name: "JavaScript / Node.js",
    icon: "🟨",
    install: "npm install @blineit/sdk",
    code: `const BLineIt = require('@blineit/sdk');

const client = new BLineIt({
  apiKey: 'blit_prod_sk_...'
});

const portfolio = await client.portfolio.get();`,
    docs: "#",
    github: "#",
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    install: "pip install blineit",
    code: `from blineit import BLineIt

client = BLineIt(api_key='blit_prod_sk_...')
portfolio = client.portfolio.get()`,
    docs: "#",
    github: "#",
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: "💎",
    install: "gem install blineit",
    code: `require 'blineit'

client = BLineIt::Client.new(api_key: 'blit_prod_sk_...')
portfolio = client.portfolio.get`,
    docs: "#",
    github: "#",
  },
  {
    id: "go",
    name: "Go",
    icon: "🔵",
    install: "go get github.com/blineit/blineit-go",
    code: `import "github.com/blineit/blineit-go"

client := blineit.NewClient("blit_prod_sk_...")
portfolio, err := client.Portfolio.Get()`,
    docs: "#",
    github: "#",
  },
  {
    id: "php",
    name: "PHP",
    icon: "🐘",
    install: "composer require blineit/blineit-php",
    code: `use BLineIt\\Client;

$client = new Client('blit_prod_sk_...');
$portfolio = $client->portfolio->get();`,
    docs: "#",
    github: "#",
  },
];

const DeveloperSdks = () => {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/developers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">SDKs & Libraries</h1>
            <p className="text-muted-foreground text-sm">Official client libraries</p>
          </div>
        </div>

        <div className="space-y-4">
          {sdks.map((sdk) => (
            <Card key={sdk.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{sdk.icon}</span>
                  {sdk.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Installation</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(sdk.install)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <code className="block text-sm bg-muted px-3 py-2 rounded font-mono">
                    {sdk.install}
                  </code>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Quick Start</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(sdk.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">
                    {sdk.code}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperSdks;

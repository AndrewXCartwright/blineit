import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, FileText, Download, Calendar, DollarSign, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { mockQuarterlyReports, mockTaxDocuments, mockDistributions } from "@/hooks/useInstitutional";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";

const quarters = ["Q4 2023", "Q3 2023", "Q2 2023", "Q1 2023", "Q4 2022"];

export default function InstitutionalReports() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2023");

  const handleDownload = (docName: string) => {
    // In production, this would trigger actual download
    console.log(`Downloading ${docName}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Link to="/institutional" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Reports & Documents</h1>
            <p className="text-muted-foreground">Access your quarterly reports, K-1s, and distribution statements</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download All
            </Button>
          </div>
        </motion.div>

        {/* Quarterly Reports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Quarterly Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockQuarterlyReports
                .filter((r) => r.quarter === selectedQuarter)
                .map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{report.fund}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.quarter} Report • Posted {format(new Date(report.postedDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(report.fund)}>
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
              {mockQuarterlyReports.filter((r) => r.quarter === selectedQuarter).length === 0 && (
                <p className="text-center text-muted-foreground py-8">No reports available for {selectedQuarter}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Tax Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTaxDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.fund}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.year} {doc.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.status === "available" ? (
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(`${doc.fund} K-1`)}>
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    ) : (
                      <Badge variant="outline">Coming Soon</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribution Statements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Distribution Statements
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 font-medium text-muted-foreground">Fund</th>
                      <th className="text-right py-3 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDistributions.map((dist) => (
                      <tr key={dist.id} className="border-b border-border/50">
                        <td className="py-3">{format(new Date(dist.date), "MMM d, yyyy")}</td>
                        <td className="py-3">{dist.fund}</td>
                        <td className="py-3 text-right font-semibold text-success">
                          {formatCurrency(dist.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={2} className="py-3 font-semibold">Total Distributions</td>
                      <td className="py-3 text-right font-bold text-success">
                        {formatCurrency(mockDistributions.reduce((sum, d) => sum + d.amount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

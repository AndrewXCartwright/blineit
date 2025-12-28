import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Building2, Plus, Trash2, Upload, FileText, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useInstitutionalAccount, EntityFormData } from "@/hooks/useInstitutional";
import { toast } from "sonner";

const entityTypes = [
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "C-Corporation" },
  { value: "s_corp", label: "S-Corporation" },
  { value: "partnership", label: "LP / LLP" },
  { value: "trust", label: "Trust" },
  { value: "family_office", label: "Family Office" },
  { value: "ria", label: "RIA" },
  { value: "pension", label: "Pension Plan" },
];

const requiredDocuments = [
  { id: "formation", name: "Certificate of Formation", required: true },
  { id: "operating", name: "Operating Agreement", required: true },
  { id: "ein", name: "EIN Letter", required: true },
  { id: "resolution", name: "Resolution Authorizing Investment", required: true },
];

interface Signer {
  name: string;
  title: string;
  email: string;
}

export default function InstitutionalEntitySetup() {
  const { account, createAccount, updateAccount } = useInstitutionalAccount();
  
  const [formData, setFormData] = useState({
    entity_name: account?.entity_name || "",
    entity_type: account?.entity_type || "",
    ein: "",
    formation_state: account?.formation_state || "",
    formation_date: account?.formation_date || "",
  });

  const [signers, setSigners] = useState<Signer[]>([
    { name: "", title: "", email: "" }
  ]);

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});

  const handleAddSigner = () => {
    setSigners([...signers, { name: "", title: "", email: "" }]);
  };

  const handleRemoveSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const handleSignerChange = (index: number, field: keyof Signer, value: string) => {
    const newSigners = [...signers];
    newSigners[index][field] = value;
    setSigners(newSigners);
  };

  const handleSubmit = async () => {
    if (!formData.entity_name || !formData.entity_type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (account) {
        await updateAccount.mutateAsync({
          entity_name: formData.entity_name,
          entity_type: formData.entity_type,
          formation_state: formData.formation_state,
          formation_date: formData.formation_date,
          authorized_signers: signers.filter(s => s.name),
        });
      } else {
        await createAccount.mutateAsync({
          entity_name: formData.entity_name,
          entity_type: formData.entity_type,
          ein: formData.ein,
          formation_state: formData.formation_state,
          formation_date: formData.formation_date,
          authorized_signers: signers.filter(s => s.name),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Link to="/institutional" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Entity Setup</h1>
          <p className="text-muted-foreground">Configure your institutional investing entity</p>
        </motion.div>

        {/* Entity Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Entity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity_name">Entity Name *</Label>
                  <Input 
                    id="entity_name"
                    value={formData.entity_name}
                    onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
                    placeholder="Acme Capital Partners LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entity_type">Entity Type *</Label>
                  <Select 
                    value={formData.entity_type}
                    onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN *</Label>
                  <Input 
                    id="ein"
                    value={formData.ein}
                    onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formation_state">State of Formation *</Label>
                  <Input 
                    id="formation_state"
                    value={formData.formation_state}
                    onChange={(e) => setFormData({ ...formData, formation_state: e.target.value })}
                    placeholder="Delaware"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="formation_date">Date of Formation</Label>
                  <Input 
                    id="formation_date"
                    type="date"
                    value={formData.formation_date}
                    onChange={(e) => setFormData({ ...formData, formation_date: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Authorized Signers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Authorized Signers</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddSigner} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Another Signer
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {signers.map((signer, index) => (
                <div key={index} className="p-4 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Signer {index + 1}</span>
                    {signers.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveSigner(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        value={signer.name}
                        onChange={(e) => handleSignerChange(index, "name", e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={signer.title}
                        onChange={(e) => handleSignerChange(index, "title", e.target.value)}
                        placeholder="Managing Partner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={signer.email}
                        onChange={(e) => handleSignerChange(index, "email", e.target.value)}
                        placeholder="john@acmecapital.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Required Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requiredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {uploadedDocs[doc.id] ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      {doc.required && <span className="text-xs text-muted-foreground">Required</span>}
                    </div>
                  </div>
                  <Button 
                    variant={uploadedDocs[doc.id] ? "outline" : "default"} 
                    size="sm"
                    className="gap-2"
                    onClick={() => setUploadedDocs({ ...uploadedDocs, [doc.id]: true })}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadedDocs[doc.id] ? "Replace" : "Upload"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleSubmit}
            disabled={createAccount.isPending || updateAccount.isPending}
          >
            {account ? "Update Entity" : "Create Entity"}
          </Button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

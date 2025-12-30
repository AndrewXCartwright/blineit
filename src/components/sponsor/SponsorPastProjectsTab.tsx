import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Building, 
  Plus, 
  Upload, 
  Trash2, 
  GripVertical,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface PastProject {
  id: string;
  projectName: string;
  propertyType: string;
  locationCity: string;
  locationState: string;
  imageUrl: string;
  acquisitionDate: string;
  exitDate: string;
  purchasePrice: string;
  salePrice: string;
  investorIrr: string;
  description: string;
  isPublic: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

const propertyTypes = [
  "Multifamily",
  "Office",
  "Retail",
  "Industrial",
  "Mixed-Use",
  "Hospitality",
  "Self-Storage",
  "Medical Office",
  "Senior Living",
  "Student Housing",
  "Land",
  "Other"
];

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const emptyProject: Omit<PastProject, 'id' | 'reviewStatus'> = {
  projectName: "",
  propertyType: "",
  locationCity: "",
  locationState: "",
  imageUrl: "",
  acquisitionDate: "",
  exitDate: "",
  purchasePrice: "",
  salePrice: "",
  investorIrr: "",
  description: "",
  isPublic: true
};

export function SponsorPastProjectsTab() {
  const [projects, setProjects] = useState<PastProject[]>([
    {
      id: '1',
      projectName: 'Sunset Gardens Apartments',
      propertyType: 'Multifamily',
      locationCity: 'Tampa',
      locationState: 'FL',
      imageUrl: '',
      acquisitionDate: '2020-06-15',
      exitDate: '2024-01-20',
      purchasePrice: '12500000',
      salePrice: '18750000',
      investorIrr: '22.4',
      description: 'A 120-unit value-add multifamily property that we successfully renovated and sold.',
      isPublic: true,
      reviewStatus: 'approved'
    },
    {
      id: '2',
      projectName: 'Industrial Park West',
      propertyType: 'Industrial',
      locationCity: 'Dallas',
      locationState: 'TX',
      imageUrl: '',
      acquisitionDate: '2019-03-01',
      exitDate: '2023-09-15',
      purchasePrice: '8000000',
      salePrice: '12200000',
      investorIrr: '19.8',
      description: 'A 150,000 SF industrial facility with long-term tenant leases.',
      isPublic: true,
      reviewStatus: 'approved'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PastProject | null>(null);
  const [formData, setFormData] = useState<Omit<PastProject, 'id' | 'reviewStatus'>>(emptyProject);

  const handleOpenModal = (project?: PastProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        projectName: project.projectName,
        propertyType: project.propertyType,
        locationCity: project.locationCity,
        locationState: project.locationState,
        imageUrl: project.imageUrl,
        acquisitionDate: project.acquisitionDate,
        exitDate: project.exitDate,
        purchasePrice: project.purchasePrice,
        salePrice: project.salePrice,
        investorIrr: project.investorIrr,
        description: project.description,
        isPublic: project.isPublic
      });
    } else {
      setEditingProject(null);
      setFormData(emptyProject);
    }
    setIsModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!formData.projectName || !formData.propertyType || !formData.locationCity || !formData.locationState) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingProject) {
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...formData, reviewStatus: 'pending' as const }
          : p
      ));
      toast.success("Project updated - pending review");
    } else {
      const newProject: PastProject = {
        id: Date.now().toString(),
        ...formData,
        reviewStatus: 'pending'
      };
      setProjects([...projects, newProject]);
      toast.success("Project added - pending review");
    }
    setIsModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success("Project removed");
  };

  const handleTogglePublic = (id: string) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    ));
  };

  const getStatusBadge = (status: PastProject['reviewStatus']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Past Projects
              </CardTitle>
              <CardDescription>
                Showcase your track record to build investor confidence
              </CardDescription>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProject ? 'Edit Project' : 'Add Past Project'}</DialogTitle>
                  <DialogDescription>
                    {editingProject ? 'Update your project details' : 'Showcase a completed project from your track record'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="e.g., Sunset Gardens Apartments"
                    />
                  </div>

                  {/* Property Type & Location */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Property Type *</Label>
                      <Select 
                        value={formData.propertyType}
                        onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.locationCity}
                        onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select 
                        value={formData.locationState}
                        onValueChange={(value) => setFormData({ ...formData, locationState: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {usStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Property Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acquisitionDate">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Acquisition Date
                      </Label>
                      <Input
                        id="acquisitionDate"
                        type="date"
                        value={formData.acquisitionDate}
                        onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exitDate">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Exit Date
                      </Label>
                      <Input
                        id="exitDate"
                        type="date"
                        value={formData.exitDate}
                        onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        Purchase Price
                      </Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salePrice">
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        Sale Price
                      </Label>
                      <Input
                        id="salePrice"
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investorIrr">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Investor IRR (%)
                      </Label>
                      <Input
                        id="investorIrr"
                        type="number"
                        step="0.1"
                        value={formData.investorIrr}
                        onChange={(e) => setFormData({ ...formData, investorIrr: e.target.value })}
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the project and investment thesis..."
                      rows={3}
                    />
                  </div>

                  {/* Public Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic">Show on Public Profile</Label>
                      <p className="text-xs text-muted-foreground">
                        This project will be visible to all investors
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProject}>
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No past projects added yet</p>
              <p className="text-sm">Add projects to showcase your track record</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div 
                  key={project.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                  
                  <div className="w-20 h-14 rounded bg-muted flex items-center justify-center shrink-0">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.projectName} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Building className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{project.projectName}</h4>
                      {getStatusBadge(project.reviewStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.locationCity}, {project.locationState}
                      </span>
                      <span>{project.propertyType}</span>
                      <span className="text-emerald-500 font-medium">{project.investorIrr}% IRR</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublic(project.id)}
                      className={project.isPublic ? "text-primary" : "text-muted-foreground"}
                    >
                      {project.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Past projects are reviewed before appearing on your public profile. This typically takes 1-2 business days.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

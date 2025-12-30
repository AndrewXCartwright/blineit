import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Users, 
  Plus, 
  Upload, 
  Trash2, 
  GripVertical,
  Edit,
  Linkedin,
  FileText,
  MapPin,
  Building2,
  Award,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  linkedinUrl: string;
  bio: string;
}

interface Credential {
  id: string;
  name: string;
  type: string;
  organization: string;
  documentUrl: string;
  isVerified: boolean;
}

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const assetClasses = [
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
  "Land Development"
];

const credentialTypes = [
  "CPA",
  "Real Estate License",
  "Series 7",
  "Series 63",
  "Series 65",
  "CFA",
  "CCIM",
  "CPM",
  "MBA",
  "JD",
  "Other"
];

export function SponsorTeamTab() {
  // Team Members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      title: 'Managing Partner',
      photoUrl: '',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      bio: '20+ years of real estate investment experience with focus on multifamily value-add strategies.'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'Chief Investment Officer',
      photoUrl: '',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      bio: 'Former Goldman Sachs analyst with expertise in underwriting and deal structuring.'
    }
  ]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<TeamMember, 'id'>>({
    name: '',
    title: '',
    photoUrl: '',
    linkedinUrl: '',
    bio: ''
  });

  // Credentials
  const [credentials, setCredentials] = useState<Credential[]>([
    { id: '1', name: 'CPA License', type: 'CPA', organization: 'AICPA', documentUrl: '', isVerified: true },
    { id: '2', name: 'Real Estate Broker', type: 'Real Estate License', organization: 'State of California', documentUrl: '', isVerified: true },
  ]);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [credentialForm, setCredentialForm] = useState<Omit<Credential, 'id' | 'isVerified'>>({
    name: '',
    type: '',
    organization: '',
    documentUrl: ''
  });

  // Enhanced Bio
  const [investmentThesis, setInvestmentThesis] = useState("We focus on value-add multifamily properties in high-growth markets across the Sun Belt region. Our strategy combines operational improvements with strategic capital expenditures to maximize returns for our investors.");
  const [geographicFocus, setGeographicFocus] = useState<string[]>(["CA", "TX", "FL", "AZ"]);
  const [assetSpecialties, setAssetSpecialties] = useState<string[]>(["Multifamily", "Industrial", "Mixed-Use"]);
  const [fullBio, setFullBio] = useState("Sunset Properties LLC is a premier real estate investment firm founded in 2008. With over $500M in assets under management and a track record of 40+ successful investments, we have consistently delivered superior returns to our investor partners.\n\nOur team combines deep real estate expertise with institutional-grade processes to identify, acquire, and manage high-quality commercial properties. We focus on markets with strong fundamentals: population growth, job creation, and limited new supply.");

  // Team Member handlers
  const handleOpenTeamModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name,
        title: member.title,
        photoUrl: member.photoUrl,
        linkedinUrl: member.linkedinUrl,
        bio: member.bio
      });
    } else {
      setEditingMember(null);
      setMemberForm({ name: '', title: '', photoUrl: '', linkedinUrl: '', bio: '' });
    }
    setIsTeamModalOpen(true);
  };

  const handleSaveMember = () => {
    if (!memberForm.name || !memberForm.title) {
      toast.error("Please fill in name and title");
      return;
    }

    if (editingMember) {
      setTeamMembers(teamMembers.map(m => 
        m.id === editingMember.id ? { ...m, ...memberForm } : m
      ));
      toast.success("Team member updated");
    } else {
      setTeamMembers([...teamMembers, { id: Date.now().toString(), ...memberForm }]);
      toast.success("Team member added");
    }
    setIsTeamModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success("Team member removed");
  };

  // Credential handlers
  const handleSaveCredential = () => {
    if (!credentialForm.name || !credentialForm.type) {
      toast.error("Please fill in credential name and type");
      return;
    }

    setCredentials([...credentials, { 
      id: Date.now().toString(), 
      ...credentialForm, 
      isVerified: false 
    }]);
    setIsCredentialModalOpen(false);
    setCredentialForm({ name: '', type: '', organization: '', documentUrl: '' });
    toast.success("Credential added - pending verification");
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
    toast.success("Credential removed");
  };

  const toggleGeographicFocus = (state: string) => {
    setGeographicFocus(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const toggleAssetSpecialty = (asset: string) => {
    setAssetSpecialties(prev => 
      prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Full Bio / Company Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Company Bio
          </CardTitle>
          <CardDescription>
            Full company description that appears on your public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullBio">Company Description</Label>
            <Textarea
              id="fullBio"
              value={fullBio}
              onChange={(e) => setFullBio(e.target.value)}
              placeholder="Tell investors about your company history, experience, and what makes you unique..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">This is the main bio shown on your sponsor profile</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="investmentThesis">Investment Thesis</Label>
            <Textarea
              id="investmentThesis"
              value={investmentThesis}
              onChange={(e) => setInvestmentThesis(e.target.value)}
              placeholder="Describe your investment strategy and philosophy..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">A clear statement of your investment approach</p>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Geographic Focus
          </CardTitle>
          <CardDescription>
            Select the states/regions where you primarily invest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {usStates.map(state => (
              <Badge
                key={state}
                variant={geographicFocus.includes(state) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleGeographicFocus(state)}
              >
                {state}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {geographicFocus.length > 0 ? geographicFocus.join(', ') : 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Asset Class Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Asset Class Specialties
          </CardTitle>
          <CardDescription>
            Select the property types you specialize in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assetClasses.map(asset => (
              <div key={asset} className="flex items-center space-x-2">
                <Checkbox
                  id={asset}
                  checked={assetSpecialties.includes(asset)}
                  onCheckedChange={() => toggleAssetSpecialty(asset)}
                />
                <Label htmlFor={asset} className="cursor-pointer">{asset}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription>
                Add key team members that investors should know about
              </CardDescription>
            </div>
            <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleOpenTeamModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                  <DialogDescription>
                    Add details about a key team member
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={memberForm.photoUrl} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {memberForm.name ? getInitials(memberForm.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name *</Label>
                      <Input
                        id="memberName"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberTitle">Title *</Label>
                      <Input
                        id="memberTitle"
                        value={memberForm.title}
                        onChange={(e) => setMemberForm({ ...memberForm, title: e.target.value })}
                        placeholder="e.g., Managing Partner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memberLinkedin">
                      <Linkedin className="h-3 w-3 inline mr-1" />
                      LinkedIn URL
                    </Label>
                    <Input
                      id="memberLinkedin"
                      value={memberForm.linkedinUrl}
                      onChange={(e) => setMemberForm({ ...memberForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memberBio">Short Bio</Label>
                    <Textarea
                      id="memberBio"
                      value={memberForm.bio}
                      onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                      placeholder="Brief background and experience..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTeamModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveMember}>
                    {editingMember ? 'Update' : 'Add'} Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No team members added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                  
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={member.photoUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{member.name}</h4>
                      {member.linkedinUrl && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.title}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenTeamModal(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials & Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Credentials & Certifications
              </CardTitle>
              <CardDescription>
                Add relevant licenses and certifications to build trust
              </CardDescription>
            </div>
            <Dialog open={isCredentialModalOpen} onOpenChange={setIsCredentialModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credential</DialogTitle>
                  <DialogDescription>
                    Add a license or certification
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="credentialName">Credential Name *</Label>
                    <Input
                      id="credentialName"
                      value={credentialForm.name}
                      onChange={(e) => setCredentialForm({ ...credentialForm, name: e.target.value })}
                      placeholder="e.g., CPA License"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialType">Type *</Label>
                    <Input
                      id="credentialType"
                      value={credentialForm.type}
                      onChange={(e) => setCredentialForm({ ...credentialForm, type: e.target.value })}
                      placeholder="e.g., CPA, Real Estate License"
                      list="credential-types"
                    />
                    <datalist id="credential-types">
                      {credentialTypes.map(type => (
                        <option key={type} value={type} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialOrg">Issuing Organization</Label>
                    <Input
                      id="credentialOrg"
                      value={credentialForm.organization}
                      onChange={(e) => setCredentialForm({ ...credentialForm, organization: e.target.value })}
                      placeholder="e.g., State of California"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Document (optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCredentialModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCredential}>
                    Add Credential
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No credentials added yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {credentials.map((cred) => (
                <div 
                  key={cred.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card"
                >
                  {cred.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium text-sm">{cred.name}</span>
                  <span className="text-xs text-muted-foreground">• {cred.organization}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteCredential(cred.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Credentials are verified before displaying the verified badge on your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

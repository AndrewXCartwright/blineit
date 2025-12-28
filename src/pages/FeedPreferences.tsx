import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Building2,
  Megaphone,
  TrendingUp,
  Users,
  Gift,
  Mail,
  Save
} from 'lucide-react';

export default function FeedPreferences() {
  const { preferences, savePreferences, isSavingPreferences } = useNewsFeed();
  
  const [showPropertyUpdates, setShowPropertyUpdates] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [showMarketNews, setShowMarketNews] = useState(true);
  const [showSocialActivity, setShowSocialActivity] = useState(true);
  const [propertiesFilter, setPropertiesFilter] = useState<'all' | 'selected'>('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'construction',
    'leasing',
    'financial',
    'distribution',
    'milestone'
  ]);
  const [emailDigest, setEmailDigest] = useState('weekly');

  // Demo properties
  const properties = [
    { id: 'prop-1', name: 'Sunset Apartments' },
    { id: 'prop-2', name: 'Marina Heights' },
    { id: 'prop-3', name: 'Downtown Tower' },
    { id: 'prop-4', name: 'Phoenix Retail' },
  ];

  const categories = [
    { id: 'construction', label: 'Construction/Renovation' },
    { id: 'leasing', label: 'Leasing Updates' },
    { id: 'financial', label: 'Financial Reports' },
    { id: 'distribution', label: 'Distributions' },
    { id: 'milestone', label: 'Milestones' },
    { id: 'general', label: 'General Updates' },
  ];

  useEffect(() => {
    if (preferences) {
      setShowPropertyUpdates(preferences.show_property_updates);
      setShowAnnouncements(preferences.show_announcements);
      setShowMarketNews(preferences.show_market_news);
      setShowSocialActivity(preferences.show_social_activity);
      setEmailDigest(preferences.email_digest);
      if (preferences.properties_filter) {
        setPropertiesFilter('selected');
        setSelectedProperties(preferences.properties_filter);
      }
      if (preferences.categories_filter) {
        setSelectedCategories(preferences.categories_filter);
      }
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await savePreferences({
        show_property_updates: showPropertyUpdates,
        show_announcements: showAnnouncements,
        show_market_news: showMarketNews,
        show_social_activity: showSocialActivity,
        properties_filter: propertiesFilter === 'all' ? null : selectedProperties,
        categories_filter: selectedCategories,
        email_digest: emailDigest,
      });
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(p => p !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/feed" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📰 Feed Preferences
          </h1>
          <p className="text-muted-foreground">Customize your news feed</p>
        </div>

        {/* Content Types */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">Content Types</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="property-updates">Property Updates</Label>
              </div>
              <Switch 
                id="property-updates"
                checked={showPropertyUpdates}
                onCheckedChange={setShowPropertyUpdates}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="announcements">Platform Announcements</Label>
              </div>
              <Switch 
                id="announcements"
                checked={showAnnouncements}
                onCheckedChange={setShowAnnouncements}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="market-news">Market News</Label>
              </div>
              <Switch 
                id="market-news"
                checked={showMarketNews}
                onCheckedChange={setShowMarketNews}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="social-activity">Social Activity</Label>
              </div>
              <Switch 
                id="social-activity"
                checked={showSocialActivity}
                onCheckedChange={setShowSocialActivity}
              />
            </div>
          </div>
        </Card>

        {/* Property Filter */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">Property Filter</h2>
          
          <RadioGroup value={propertiesFilter} onValueChange={(v) => setPropertiesFilter(v as 'all' | 'selected')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all-properties" />
              <Label htmlFor="all-properties">All properties I'm invested in</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="selected" id="selected-properties" />
              <Label htmlFor="selected-properties">Selected properties only</Label>
            </div>
          </RadioGroup>

          {propertiesFilter === 'selected' && (
            <div className="ml-6 space-y-2">
              {properties.map(property => (
                <div key={property.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={property.id}
                    checked={selectedProperties.includes(property.id)}
                    onCheckedChange={() => toggleProperty(property.id)}
                  />
                  <Label htmlFor={property.id}>{property.name}</Label>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Categories */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">Update Categories</h2>
          
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label htmlFor={category.id}>{category.label}</Label>
              </div>
            ))}
          </div>
        </Card>

        {/* Email Digest */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Email Digest</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Receive a summary of updates via email
          </p>
          
          <RadioGroup value={emailDigest} onValueChange={setEmailDigest}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="digest-none" />
              <Label htmlFor="digest-none">Never</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="digest-daily" />
              <Label htmlFor="digest-daily">Daily (every morning)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="digest-weekly" />
              <Label htmlFor="digest-weekly">Weekly (every Monday)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="digest-monthly" />
              <Label htmlFor="digest-monthly">Monthly (1st of month)</Label>
            </div>
          </RadioGroup>
        </Card>

        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={isSavingPreferences}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}

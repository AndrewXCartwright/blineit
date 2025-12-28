import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePropertyUpdate } from '@/hooks/useNewsFeed';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Building2, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Download,
  FileText,
  Play
} from 'lucide-react';
import { CommentSection } from '@/components/CommentSection';

const updateTypeLabels: Record<string, string> = {
  renovation: 'Renovation Update',
  construction: 'Construction Update',
  distribution: 'Distribution',
  leasing: 'Leasing Update',
  financial: 'Financial Update',
  milestone: 'Milestone',
  general: 'Update',
};

const propertyNames: Record<string, string> = {
  'prop-1': 'Sunset Apartments',
  'prop-2': 'Marina Heights',
  'prop-3': 'Phoenix Development',
};

export default function UpdateDetail() {
  const { id } = useParams();
  const update = usePropertyUpdate(id || '');

  if (!update) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Update not found</p>
            <Link to="/feed">
              <Button className="mt-4">Back to Feed</Button>
            </Link>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/feed" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{propertyNames[update.item_id] || 'Property'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{updateTypeLabels[update.update_type]}</Badge>
          {update.is_major && <Badge variant="default">Major Update</Badge>}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{update.title}</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(update.published_at), 'MMMM d, yyyy')} • B-LINE-IT Asset Management
          </p>
        </div>

        {/* Images */}
        {update.images.length > 0 && (
          <div className="space-y-2">
            <img 
              src={update.images[0]} 
              alt=""
              className="w-full h-64 object-cover rounded-lg"
            />
            {update.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {update.images.slice(1, 5).map((img, i) => (
                  <img 
                    key={i}
                    src={img} 
                    alt=""
                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video */}
        {update.video_url && (
          <Card className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Video Update</p>
              <p className="text-sm text-muted-foreground">Watch the full video</p>
            </div>
            <Button variant="outline">Play</Button>
          </Card>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {update.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Documents */}
        {update.documents.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Attached Documents</h3>
            {update.documents.map((doc, i) => (
              <Card key={i} className="p-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1">{doc.name}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div className="flex items-center justify-between py-4 border-y">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> 234 views
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> 12 comments
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> 45 likes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-1" />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments */}
        <CommentSection entityType="property" entityId={update.id} />
      </main>

      <BottomNav />
    </div>
  );
}

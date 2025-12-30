import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  Image, 
  Upload, 
  Trash2, 
  GripVertical,
  Play,
  Lightbulb,
  X
} from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
}

export function SponsorMediaTab() {
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [photos, setPhotos] = useState<MediaItem[]>([
    { id: '1', type: 'photo', url: '', caption: 'Team meeting' },
    { id: '2', type: 'photo', url: '', caption: 'Office headquarters' },
  ]);
  const [newCaption, setNewCaption] = useState("");

  const handleAddPhoto = () => {
    if (photos.length >= 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }
    const newPhoto: MediaItem = {
      id: Date.now().toString(),
      type: 'photo',
      url: '',
      caption: newCaption || `Photo ${photos.length + 1}`
    };
    setPhotos([...photos, newPhoto]);
    setNewCaption("");
    toast.success("Photo added");
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
    toast.success("Photo removed");
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, caption } : p));
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube/Vimeo URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const isValidVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  return (
    <div className="space-y-6">
      {/* Introduction Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Introduction Video
          </CardTitle>
          <CardDescription>
            Upload a video introducing yourself and your company to potential investors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video_url">YouTube or Vimeo URL</Label>
            <Input
              id="video_url"
              value={introVideoUrl}
              onChange={(e) => setIntroVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {introVideoUrl && isValidVideoUrl(introVideoUrl) && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={getVideoEmbedUrl(introVideoUrl)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {introVideoUrl && !isValidVideoUrl(introVideoUrl) && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              Please enter a valid YouTube or Vimeo URL
            </div>
          )}

          <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Tips for a great intro video:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep it under 3 minutes</li>
                <li>Introduce your team and company history</li>
                <li>Share your investment philosophy</li>
                <li>Highlight your track record and expertise</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Photo Gallery
          </CardTitle>
          <CardDescription>
            Upload up to 10 company or team photos to showcase on your public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Photos */}
          {photos.length > 0 && (
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                  
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                    {photo.url ? (
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Image className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Input
                      value={photo.caption}
                      onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                      placeholder="Add a caption..."
                      className="h-8"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Photo {index + 1}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Add New Photo */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Add photos to your gallery</p>
            <p className="text-sm text-muted-foreground mb-3">
              {10 - photos.length} photos remaining • JPG, PNG up to 5MB each
            </p>
            <Button 
              variant="outline" 
              onClick={handleAddPhoto}
              disabled={photos.length >= 10}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Drag to reorder. Photos will appear on your public sponsor profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

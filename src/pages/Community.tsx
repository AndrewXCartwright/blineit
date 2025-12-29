import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Building2, Target, TrendingUp, Users, Sparkles, Plus, X, Loader2 } from "lucide-react";
import { usePosts, UserPost } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface PropertyOption {
  id: string;
  name: string;
  city: string;
  state: string;
  apy: number;
}

interface PredictionOption {
  id: string;
  question: string;
  yes_price: number;
}

export default function Community() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<"following" | "trending" | "new">("new");
  const { posts, loading, createPost, toggleLike, uploadImage } = usePosts(feedType);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Property tagging state
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  
  // Prediction tagging state
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionSearch, setPredictionSearch] = useState("");
  const [predictionOptions, setPredictionOptions] = useState<PredictionOption[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionOption | null>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const scrollToCreatePost = () => {
    setShowCreatePost(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const searchProperties = async (query: string) => {
    if (query.length < 2) {
      setPropertyOptions([]);
      return;
    }
    setLoadingProperties(true);
    try {
      const { data } = await supabase
        .from("properties")
        .select("id, name, city, state, apy")
        .ilike("name", `%${query}%`)
        .limit(5);
      setPropertyOptions(data || []);
    } finally {
      setLoadingProperties(false);
    }
  };

  const searchPredictions = async (query: string) => {
    if (query.length < 2) {
      setPredictionOptions([]);
      return;
    }
    setLoadingPredictions(true);
    try {
      const { data } = await supabase
        .from("prediction_markets")
        .select("id, question, yes_price")
        .ilike("question", `%${query}%`)
        .eq("is_resolved", false)
        .limit(5);
      setPredictionOptions(data || []);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    
    let imageUrl: string | undefined;
    
    if (selectedImage) {
      setIsUploadingImage(true);
      const url = await uploadImage(selectedImage);
      setIsUploadingImage(false);
      if (url) {
        imageUrl = url;
      }
    }
    
    const success = await createPost(
      newPostContent,
      selectedProperty?.id,
      selectedPrediction?.id,
      imageUrl
    );
    
    if (success) {
      setNewPostContent("");
      removeImage();
      setSelectedProperty(null);
      setSelectedPrediction(null);
    }
    setIsPosting(false);
  };

  const handleShare = async (post: UserPost) => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">{t('community.title')}</h1>
          <Link to="/leaderboard">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('community.leaderboard')}
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Feed Tabs */}
        <div className="flex gap-2">
          {[
            { key: "new", label: t('community.new'), icon: Sparkles },
            { key: "trending", label: t('community.trending'), icon: TrendingUp },
            { key: "following", label: t('community.following'), icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFeedType(key as typeof feedType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                feedType === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Create Post */}
        {user ? (
          <div className={`glass-card rounded-2xl p-5 ${showCreatePost ? 'ring-2 ring-primary' : ''}`}>
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder={t('community.whatsOnYourMind')}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[80px] resize-none mb-3"
                  maxLength={1000}
                  autoFocus={showCreatePost}
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mb-3 inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 rounded-lg object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Selected Property */}
                {selectedProperty && (
                  <div className="mb-3 p-3 bg-secondary rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{selectedProperty.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedProperty.city}, {selectedProperty.state}
                      </span>
                    </div>
                    <button onClick={() => setSelectedProperty(null)}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                )}
                
                {/* Selected Prediction */}
                {selectedPrediction && (
                  <div className="mb-3 p-3 bg-secondary rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium line-clamp-1">{selectedPrediction.question}</span>
                    </div>
                    <button onClick={() => setSelectedPrediction(null)}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!!selectedImage}
                    >
                      <ImageIcon className="w-4 h-4" />
                      {t('community.image')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowPropertyModal(true)}
                      disabled={!!selectedProperty}
                    >
                      <Building2 className="w-4 h-4" />
                      {t('community.tagProperty')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowPredictionModal(true)}
                      disabled={!!selectedPrediction}
                    >
                      <Target className="w-4 h-4" />
                      {t('community.tagPrediction')}
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || isPosting || isUploadingImage}
                    className="gap-2"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isPosting ? t('community.posting') : t('community.post')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-5 text-center">
            <p className="text-muted-foreground">
              <Link to="/auth" className="text-primary hover:underline">
                {t('auth.signIn')}
              </Link>{" "}
              {t('community.toJoin')}
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-display font-semibold text-foreground mb-2">
              {t('community.noPostsYet')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('community.beFirst')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike(post.id)}
                onShare={() => handleShare(post)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Create Post Button */}
      {user && (
        <button
          onClick={scrollToCreatePost}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full gradient-primary glow-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label={t('community.createPost')}
        >
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      )}

      {/* Property Selection Modal */}
      <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag a Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search properties..."
              value={propertySearch}
              onChange={(e) => {
                setPropertySearch(e.target.value);
                searchProperties(e.target.value);
              }}
            />
            {loadingProperties ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : propertyOptions.length > 0 ? (
              <div className="space-y-2">
                {propertyOptions.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowPropertyModal(false);
                      setPropertySearch("");
                      setPropertyOptions([]);
                    }}
                    className="w-full p-3 text-left rounded-lg hover:bg-secondary transition-colors"
                  >
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.city}, {property.state} • {property.apy}% APY
                    </p>
                  </button>
                ))}
              </div>
            ) : propertySearch.length >= 2 ? (
              <p className="text-center text-muted-foreground py-4">No properties found</p>
            ) : (
              <p className="text-center text-muted-foreground py-4">Type to search...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prediction Selection Modal */}
      <Dialog open={showPredictionModal} onOpenChange={setShowPredictionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag a Prediction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search predictions..."
              value={predictionSearch}
              onChange={(e) => {
                setPredictionSearch(e.target.value);
                searchPredictions(e.target.value);
              }}
            />
            {loadingPredictions ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : predictionOptions.length > 0 ? (
              <div className="space-y-2">
                {predictionOptions.map((prediction) => (
                  <button
                    key={prediction.id}
                    onClick={() => {
                      setSelectedPrediction(prediction);
                      setShowPredictionModal(false);
                      setPredictionSearch("");
                      setPredictionOptions([]);
                    }}
                    className="w-full p-3 text-left rounded-lg hover:bg-secondary transition-colors"
                  >
                    <p className="font-medium line-clamp-2">{prediction.question}</p>
                    <p className="text-sm text-muted-foreground">
                      {(prediction.yes_price * 100).toFixed(0)}% Yes
                    </p>
                  </button>
                ))}
              </div>
            ) : predictionSearch.length >= 2 ? (
              <p className="text-center text-muted-foreground py-4">No predictions found</p>
            ) : (
              <p className="text-center text-muted-foreground py-4">Type to search...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PostCardProps {
  post: UserPost;
  onLike: () => void;
  onShare: () => void;
}

function PostCard({ post, onLike, onShare }: PostCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <Link to={`/user/${post.user_id}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {post.user?.display_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={`/user/${post.user_id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {post.user?.display_name || "Unknown"}
            </Link>
            {post.user?.is_verified_investor && (
              <span className="text-primary">✓</span>
            )}
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-foreground mt-2 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Post Image */}
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="mt-3 rounded-xl max-h-96 w-full object-cover"
            />
          )}

          {/* Tagged Property */}
          {post.property && (
            <Link
              to={`/property/${post.property_id}`}
              className="mt-3 block glass-card rounded-xl p-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.property.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {post.property.city}, {post.property.state} • {post.property.apy}% APY • ${post.property.token_price}/token
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 transition-colors ${
                post.is_liked
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? "fill-current" : ""}`} />
              <span className="text-sm">{post.likes_count}</span>
            </button>

            <Link
              to={`/post/${post.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count}</span>
            </Link>

            <button
              onClick={onShare}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
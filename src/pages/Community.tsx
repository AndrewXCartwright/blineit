import { useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Building2, Target, TrendingUp, Users, Sparkles, Plus, X, Loader2, Video, UserPlus, Search } from "lucide-react";
import { usePosts, UserPost } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface UserOption {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export default function Community() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedType, setFeedType] = useState<"following" | "trending" | "new">("new");
  const { posts, loading, createPost, toggleLike, uploadMedia, searchUsers } = usePosts(feedType);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: { user_id: string; display_name: string; avatar_url: string | null }[];
    properties: { id: string; name: string; city: string; state: string }[];
    posts: { id: string; content: string; user_display_name: string }[];
  }>({ users: [], properties: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Media upload state
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
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

  // People tagging state
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState("");
  const [peopleOptions, setPeopleOptions] = useState<UserOption[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<UserOption[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // Community search function
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults({ users: [], properties: [], posts: [] });
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Search users
      const { data: users } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .ilike("display_name", `%${query}%`)
        .limit(5);

      // Search properties
      const { data: properties } = await supabase
        .from("properties")
        .select("id, name, city, state")
        .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
        .limit(5);

      // Search posts
      const { data: postsData } = await (supabase as any)
        .from("user_posts")
        .select("id, content, user_id")
        .ilike("content", `%${query}%`)
        .eq("is_hidden", false)
        .limit(5);

      // Get user names for posts
      let postsWithUsers: { id: string; content: string; user_display_name: string }[] = [];
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds as string[]);

        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.user_id] = p.display_name;
          return acc;
        }, {});

        postsWithUsers = postsData.map((post: any) => ({
          id: post.id,
          content: post.content.slice(0, 80) + (post.content.length > 80 ? "..." : ""),
          user_display_name: profileMap[post.user_id] || "Unknown",
        }));
      }

      setSearchResults({
        users: users || [],
        properties: properties || [],
        posts: postsWithUsers,
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({ users: [], properties: [], posts: [] });
    setShowSearchResults(false);
  };

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
      setSelectedMedia(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType("image");
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video must be less than 50MB");
        return;
      }
      setSelectedMedia(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType("video");
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const searchPeople = async (query: string) => {
    if (query.length < 2) {
      setPeopleOptions([]);
      return;
    }
    setLoadingPeople(true);
    try {
      const results = await searchUsers(query);
      // Filter out already selected users
      const filtered = results.filter(u => !selectedPeople.some(p => p.user_id === u.user_id));
      setPeopleOptions(filtered);
    } finally {
      setLoadingPeople(false);
    }
  };

  const addPerson = (person: UserOption) => {
    if (selectedPeople.length >= 10) {
      toast.error("Maximum 10 people can be tagged");
      return;
    }
    setSelectedPeople([...selectedPeople, person]);
    setPeopleOptions(peopleOptions.filter(p => p.user_id !== person.user_id));
    setPeopleSearch("");
  };

  const removePerson = (userId: string) => {
    setSelectedPeople(selectedPeople.filter(p => p.user_id !== userId));
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
    let videoUrl: string | undefined;
    
    if (selectedMedia) {
      setIsUploadingMedia(true);
      const url = await uploadMedia(selectedMedia);
      setIsUploadingMedia(false);
      if (url) {
        if (mediaType === "image") {
          imageUrl = url;
        } else {
          videoUrl = url;
        }
      }
    }
    
    const taggedUserIds = selectedPeople.map(p => p.user_id);
    
    const success = await createPost(
      newPostContent,
      selectedProperty?.id,
      selectedPrediction?.id,
      imageUrl,
      videoUrl,
      taggedUserIds
    );
    
    if (success) {
      setNewPostContent("");
      removeMedia();
      setSelectedProperty(null);
      setSelectedPrediction(null);
      setSelectedPeople([]);
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
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">{t('community.title')}</h1>
          <Link to="/leaderboard">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('community.leaderboard')}
            </Button>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users, properties, posts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-[400px] overflow-hidden">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  {searchResults.users.length === 0 && 
                   searchResults.properties.length === 0 && 
                   searchResults.posts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* Users Section */}
                      {searchResults.users.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Users</p>
                          {searchResults.users.map((u) => (
                            <button
                              key={u.user_id}
                              onClick={() => {
                                navigate(`/user/${u.user_id}`);
                                clearSearch();
                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={u.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                  {u.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{u.display_name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Properties Section */}
                      {searchResults.properties.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Properties</p>
                          {searchResults.properties.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                navigate(`/property/${p.id}`);
                                clearSearch();
                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                            >
                              <div className="p-2 rounded-lg bg-primary/20">
                                <Building2 className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.city}, {p.state}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Posts Section */}
                      {searchResults.posts.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Posts</p>
                          {searchResults.posts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                navigate(`/post/${p.id}`);
                                clearSearch();
                              }}
                              className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                            >
                              <div className="p-2 rounded-lg bg-accent/20">
                                <MessageCircle className="w-4 h-4 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">by {p.user_display_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Click outside to close search results */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowSearchResults(false)}
        />
      )}

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
                
                {/* Media Preview */}
                {mediaPreview && (
                  <div className="relative mb-3 inline-block">
                    {mediaType === "image" ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="max-h-48 rounded-lg object-cover"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        className="max-h-48 rounded-lg"
                        controls
                      />
                    )}
                    <button
                      onClick={removeMedia}
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

                {/* Tagged People */}
                {selectedPeople.length > 0 && (
                  <div className="mb-3 p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Tagged People</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPeople.map((person) => (
                        <div key={person.user_id} className="flex items-center gap-1 bg-background px-2 py-1 rounded-full text-xs">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={person.avatar_url || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {person.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{person.display_name}</span>
                          <button onClick={() => removePerson(person.user_id)}>
                            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoSelect}
                      accept="video/*"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!!selectedMedia}
                    >
                      <ImageIcon className="w-4 h-4" />
                      {t('community.image')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={!!selectedMedia}
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowPeopleModal(true)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Tag People
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
                    disabled={!newPostContent.trim() || isPosting || isUploadingMedia}
                    className="gap-2"
                  >
                    {isUploadingMedia ? (
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

      {/* People Selection Modal */}
      <Dialog open={showPeopleModal} onOpenChange={setShowPeopleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag People</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={peopleSearch}
              onChange={(e) => {
                setPeopleSearch(e.target.value);
                searchPeople(e.target.value);
              }}
            />
            {loadingPeople ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : peopleOptions.length > 0 ? (
              <div className="space-y-2">
                {peopleOptions.map((person) => (
                  <button
                    key={person.user_id}
                    onClick={() => addPerson(person)}
                    className="w-full p-3 text-left rounded-lg hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={person.avatar_url || undefined} />
                      <AvatarFallback>
                        {person.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{person.display_name}</span>
                  </button>
                ))}
              </div>
            ) : peopleSearch.length >= 2 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              <p className="text-center text-muted-foreground py-4">Type to search...</p>
            )}
            
            {selectedPeople.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Selected ({selectedPeople.length}/10):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPeople.map((person) => (
                    <div key={person.user_id} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full text-xs">
                      <span>{person.display_name}</span>
                      <button onClick={() => removePerson(person.user_id)}>
                        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => {
                setShowPeopleModal(false);
                setPeopleSearch("");
                setPeopleOptions([]);
              }}
              className="w-full"
            >
              Done
            </Button>
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

          {/* Post Video */}
          {post.video_url && (
            <video 
              src={post.video_url} 
              controls
              className="mt-3 rounded-xl max-h-96 w-full"
            />
          )}

          {/* Tagged People */}
          {post.tagged_profiles && post.tagged_profiles.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="w-4 h-4" />
              <span>with</span>
              {post.tagged_profiles.map((person, index) => (
                <span key={person.user_id}>
                  <Link to={`/user/${person.user_id}`} className="text-primary hover:underline">
                    {person.display_name}
                  </Link>
                  {index < post.tagged_profiles!.length - 1 && ", "}
                </span>
              ))}
            </div>
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
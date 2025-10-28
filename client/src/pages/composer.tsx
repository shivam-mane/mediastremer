import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, X, Loader2 } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";
import type { ConnectedAccount, Platform } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PlatformPreview } from "@/components/platform-preview";
import { PublishingModal } from "@/components/publishing-modal";

const PLATFORM_LIMITS = {
  linkedin: { maxLength: 3000, name: 'LinkedIn' },
  twitter: { maxLength: 280, name: 'X (Twitter)' },
  facebook: { maxLength: 63206, name: 'Facebook' },
};

export default function Composer() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState<Record<Platform, 'pending' | 'success' | 'error'> | null>(null);

  const { data: accounts, isLoading: accountsLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const activeAccounts = accounts?.filter(a => a.isActive) || [];

  const publishMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/posts/publish", data);
    },
    onSuccess: async (response) => {
      // Parse the response to get actual publishing results
      const result = await response.json();
      const { results, status: finalStatus } = result;
      
      // Update publishing status with actual results from backend
      const updatedStatus: Record<Platform, 'pending' | 'success' | 'error'> = {} as any;
      selectedPlatforms.forEach(platform => {
        const platformResult = results.find((r: any) => r.platform === platform);
        updatedStatus[platform] = platformResult?.success ? 'success' : 'error';
      });
      
      setPublishingStatus(updatedStatus);
      
      // Wait a moment for user to see final status, then cleanup
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        setContent("");
        setSelectedPlatforms([]);
        setImageFile(null);
        setImagePreview(null);
        setIsPublishing(false);
        setPublishingStatus(null);
        
        const successCount = results.filter((r: any) => r.success).length;
        const totalCount = results.length;
        
        if (finalStatus === 'published') {
          toast({
            title: "Published Successfully",
            description: `Your post has been published to all ${totalCount} platforms.`,
          });
        } else if (finalStatus === 'partial') {
          toast({
            title: "Partially Published",
            description: `Published to ${successCount} of ${totalCount} platforms. Some failed.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Publishing Failed",
            description: "Failed to publish to all platforms.",
            variant: "destructive",
          });
        }
      }, 2000);
    },
    onError: (error) => {
      setIsPublishing(false);
      setPublishingStatus(null);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Publishing Failed",
        description: error.message || "An error occurred while publishing your post.",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 10MB.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const handlePublish = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select Platforms",
        description: "Please select at least one platform to publish to.",
        variant: "destructive",
      });
      return;
    }

    for (const platform of selectedPlatforms) {
      if (content.length > PLATFORM_LIMITS[platform].maxLength) {
        toast({
          title: "Content Too Long",
          description: `Your content exceeds ${PLATFORM_LIMITS[platform].name}'s character limit of ${PLATFORM_LIMITS[platform].maxLength}.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsPublishing(true);
    const initialStatus: Record<Platform, 'pending' | 'success' | 'error'> = {} as any;
    selectedPlatforms.forEach(p => initialStatus[p] = 'pending');
    setPublishingStatus(initialStatus);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("platforms", JSON.stringify(selectedPlatforms));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    publishMutation.mutate(formData);
  };

  const getCharacterCount = (platform: Platform) => {
    return `${content.length} / ${PLATFORM_LIMITS[platform].maxLength}`;
  };

  const isOverLimit = (platform: Platform) => {
    return content.length > PLATFORM_LIMITS[platform].maxLength;
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeAccounts.length === 0) {
    return (
      <Card data-testid="card-no-accounts">
        <CardHeader>
          <CardTitle>No Connected Accounts</CardTitle>
          <CardDescription>
            You need to connect at least one social media account before you can compose posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild data-testid="button-connect-first-account">
            <a href="/accounts">Connect Accounts</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Compose Post</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
          Create content and publish to multiple platforms simultaneously.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card data-testid="card-composer">
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write your post content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Post Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  className="min-h-48 resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  data-testid="textarea-content"
                />
                <p className="text-xs text-muted-foreground">
                  Character limits will be validated for each selected platform.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Image (Optional)</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="w-full rounded-md border"
                      data-testid="img-preview"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      data-testid="button-remove-image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-8 text-center">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      data-testid="input-file"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-platforms">
            <CardHeader>
              <CardTitle>Select Platforms</CardTitle>
              <CardDescription>Choose where to publish your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAccounts.map((account) => {
                const platform = account.platform as Platform;
                const isSelected = selectedPlatforms.includes(platform);
                const overLimit = isSelected && isOverLimit(platform);
                
                return (
                  <div
                    key={account.id}
                    className="flex items-start gap-3 p-4 rounded-md border"
                    data-testid={`platform-${platform}`}
                  >
                    <Checkbox
                      id={platform}
                      checked={isSelected}
                      onCheckedChange={() => togglePlatform(platform)}
                      data-testid={`checkbox-${platform}`}
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={platform}
                        className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                      >
                        {platform === 'linkedin' && <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />}
                        {platform === 'twitter' && <RiTwitterXFill className="w-4 h-4" />}
                        {platform === 'facebook' && <SiFacebook className="w-4 h-4 text-[#1877F2]" />}
                        <span className="capitalize">{PLATFORM_LIMITS[platform].name}</span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {account.accountName || account.accountId}
                      </p>
                      {isSelected && (
                        <p className={`text-xs ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {getCharacterCount(platform)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePublish}
            disabled={publishMutation.isPending || !content.trim() || selectedPlatforms.length === 0}
            data-testid="button-publish"
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Now'
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <p className="text-sm text-muted-foreground mb-6">
              See how your post will appear on each platform
            </p>
          </div>

          <div className="space-y-6">
            {selectedPlatforms.length === 0 ? (
              <Card className="p-8 text-center" data-testid="card-no-preview">
                <p className="text-sm text-muted-foreground">
                  Select platforms to see previews
                </p>
              </Card>
            ) : (
              selectedPlatforms.map((platform) => (
                <PlatformPreview
                  key={platform}
                  platform={platform}
                  content={content}
                  imageUrl={imagePreview}
                  account={activeAccounts.find(a => a.platform === platform)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {isPublishing && publishingStatus && (
        <PublishingModal
          platforms={selectedPlatforms}
          status={publishingStatus}
          onClose={() => {
            setIsPublishing(false);
            setPublishingStatus(null);
          }}
        />
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";
import type { Post } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'failed':
        return 'Failed';
      case 'partial':
        return 'Partially Published';
      default:
        return status;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <SiLinkedin className="w-3 h-3" />;
      case 'twitter':
        return <RiTwitterXFill className="w-3 h-3" />;
      case 'facebook':
        return <SiFacebook className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Post History</h1>
          <p className="text-muted-foreground mt-2">View all your published content</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Post History</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
          View all your published content across platforms
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm line-clamp-3 flex-1" data-testid={`text-post-content-${post.id}`}>
                      {post.content}
                    </p>
                    {getStatusIcon(post.status)}
                  </div>
                  
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-32 object-cover rounded-md"
                      data-testid={`img-post-${post.id}`}
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.platforms.map((platform) => (
                    <Badge
                      key={platform}
                      variant="secondary"
                      className="gap-1"
                      data-testid={`badge-platform-${platform}`}
                    >
                      {getPlatformIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs">
                  <span className="text-muted-foreground" data-testid={`text-post-date-${post.id}`}>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                  <span className="font-medium" data-testid={`text-post-status-${post.id}`}>
                    {getStatusText(post.status)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center" data-testid="card-empty-state">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Posts Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your published posts will appear here
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

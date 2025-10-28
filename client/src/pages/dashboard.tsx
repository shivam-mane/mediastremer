import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PenSquare, History, Link as LinkIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";
import type { ConnectedAccount, Post } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: accounts, isLoading: accountsLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const connectedCount = accounts?.filter(a => a.isActive).length || 0;
  const totalPosts = recentPosts?.length || 0;
  const recentPostsCount = recentPosts?.slice(0, 5).length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
          Welcome back! Here's an overview of your social media activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-stat-accounts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-connected-count">{connectedCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Active social platforms
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-posts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-posts">{totalPosts}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              All time published
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-recent">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-recent-posts">{recentPostsCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Posts this session
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-quick-compose">
          <CardHeader>
            <CardTitle>Quick Compose</CardTitle>
            <CardDescription>Create and publish content to all your connected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild data-testid="button-new-post">
              <Link href="/composer">
                <PenSquare className="w-4 h-4 mr-2" />
                Create New Post
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-connected-platforms">
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
            <CardDescription>Manage your social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountsLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : accounts && accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.filter(a => a.isActive).map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-3 rounded-md border"
                    data-testid={`account-${account.platform}`}
                  >
                    {account.platform === 'linkedin' && <SiLinkedin className="w-5 h-5 text-[#0A66C2]" />}
                    {account.platform === 'twitter' && <RiTwitterXFill className="w-5 h-5" />}
                    {account.platform === 'facebook' && <SiFacebook className="w-5 h-5 text-[#1877F2]" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{account.platform}</p>
                      <p className="text-xs text-muted-foreground truncate">{account.accountName || account.accountId}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">No accounts connected yet</p>
                <Button variant="outline" size="sm" asChild data-testid="button-connect-accounts">
                  <Link href="/accounts">Connect Accounts</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recentPosts && recentPosts.length > 0 && (
        <Card data-testid="card-recent-posts">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Your latest published content</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild data-testid="button-view-all-posts">
                <Link href="/history">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-start gap-4 p-4 rounded-md border"
                  data-testid={`post-${post.id}`}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted"
                          data-testid={`badge-${platform}`}
                        >
                          {platform === 'linkedin' && <SiLinkedin className="w-3 h-3" />}
                          {platform === 'twitter' && <RiTwitterXFill className="w-3 h-3" />}
                          {platform === 'facebook' && <SiFacebook className="w-3 h-3" />}
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                    <time dateTime={post.publishedAt?.toISOString()}>
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'N/A'}
                    </time>
                    {post.status === 'published' && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    {post.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    {post.status === 'partial' && (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

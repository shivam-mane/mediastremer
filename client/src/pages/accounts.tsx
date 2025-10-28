import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle2, Link2, Loader2, AlertCircle, XCircle } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";
import type { ConnectedAccount } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";

const PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: SiLinkedin,
    color: '#0A66C2',
    description: 'Connect your LinkedIn account to publish professional content',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: RiTwitterXFill,
    color: '#000000',
    description: 'Connect your X account to share quick updates and engage with followers',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: SiFacebook,
    color: '#1877F2',
    description: 'Connect your Facebook account to reach your community',
  },
];

export default function Accounts() {
  const { toast } = useToast();
  
  const { data: accounts, isLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest("DELETE", `/api/accounts/${accountId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account Disconnected",
        description: "The account has been removed successfully.",
      });
    },
    onError: (error) => {
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
        title: "Error",
        description: error.message || "Failed to disconnect account.",
        variant: "destructive",
      });
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (platformId: string) => {
      return await apiRequest("POST", `/api/accounts/connect-demo/${platformId}`, {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      const accountData = data as any;
      toast({
        title: "Account Connected",
        description: `Successfully connected ${accountData.platform} account for demo purposes.`,
      });
    },
    onError: (error) => {
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
        title: "Connection Failed",
        description: error.message || "Failed to connect account.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = (platformId: string) => {
    connectMutation.mutate(platformId);
  };

  const handleDisconnect = (accountId: string) => {
    if (confirm("Are you sure you want to disconnect this account?")) {
      disconnectMutation.mutate(accountId);
    }
  };

  const getConnectedAccount = (platformId: string) => {
    return accounts?.find(a => a.platform === platformId && a.isActive);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground mt-2">Manage your social media connections</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
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
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Connected Accounts</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
          Manage your social media platform connections
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const connectedAccount = getConnectedAccount(platform.id);
          const isConnected = !!connectedAccount;

          return (
            <Card key={platform.id} className="hover-elevate" data-testid={`card-platform-${platform.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: platform.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      {isConnected && (
                        <Badge variant="secondary" className="mt-1 gap-1" data-testid={`badge-connected-${platform.id}`}>
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected && connectedAccount ? (
                  <>
                    <div className="p-3 rounded-md bg-muted space-y-1">
                      <p className="text-sm font-medium" data-testid={`text-account-name-${platform.id}`}>
                        {connectedAccount.accountName || 'Connected Account'}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-account-id-${platform.id}`}>
                        ID: {connectedAccount.accountId}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDisconnect(connectedAccount.id)}
                      disabled={disconnectMutation.isPending}
                      data-testid={`button-disconnect-${platform.id}`}
                    >
                      {disconnectMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-md border border-dashed text-center">
                      <AlertCircle className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Not connected
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(platform.id)}
                      disabled={connectMutation.isPending}
                      data-testid={`button-connect-${platform.id}`}
                    >
                      {connectMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 mr-2" />
                          Connect {platform.name}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5" data-testid="card-info">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Secure OAuth 2.0 Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Your accounts are connected using industry-standard OAuth 2.0 protocol. 
                We never store your passwords, only secure access tokens that you can revoke at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

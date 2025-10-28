import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";
import type { Platform, ConnectedAccount } from "@shared/schema";

interface PlatformPreviewProps {
  platform: Platform;
  content: string;
  imageUrl: string | null;
  account?: ConnectedAccount;
}

export function PlatformPreview({ platform, content, imageUrl, account }: PlatformPreviewProps) {
  const getPlatformIcon = () => {
    switch (platform) {
      case 'linkedin':
        return <SiLinkedin className="w-5 h-5 text-[#0A66C2]" />;
      case 'twitter':
        return <RiTwitterXFill className="w-5 h-5" />;
      case 'facebook':
        return <SiFacebook className="w-5 h-5 text-[#1877F2]" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'X';
      case 'facebook':
        return 'Facebook';
    }
  };

  return (
    <Card data-testid={`preview-${platform}`}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
        {getPlatformIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{getPlatformName()} Preview</h3>
          <p className="text-xs text-muted-foreground">
            {account?.accountName || 'Your Account'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={account?.accountProfileUrl || undefined} />
            <AvatarFallback>
              {account?.accountName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div>
              <p className="font-medium text-sm">
                {account?.accountName || 'Your Name'}
              </p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
            {content && (
              <p className="text-sm whitespace-pre-wrap" data-testid={`preview-content-${platform}`}>
                {content}
              </p>
            )}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Post preview"
                className="w-full rounded-md border"
                data-testid={`preview-image-${platform}`}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

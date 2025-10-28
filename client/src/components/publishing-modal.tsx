import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";
import type { Platform } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface PublishingModalProps {
  platforms: Platform[];
  status: Record<Platform, 'pending' | 'success' | 'error'>;
  onClose: () => void;
}

export function PublishingModal({ platforms, status, onClose }: PublishingModalProps) {
  const total = platforms.length;
  const completed = platforms.filter(p => status[p] !== 'pending').length;
  const progress = (completed / total) * 100;
  const allComplete = completed === total;

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'linkedin':
        return <SiLinkedin className="w-5 h-5 text-[#0A66C2]" />;
      case 'twitter':
        return <RiTwitterXFill className="w-5 h-5" />;
      case 'facebook':
        return <SiFacebook className="w-5 h-5 text-[#1877F2]" />;
    }
  };

  const getPlatformName = (platform: Platform) => {
    switch (platform) {
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'X (Twitter)';
      case 'facebook':
        return 'Facebook';
    }
  };

  return (
    <Dialog open={true} onOpenChange={allComplete ? onClose : undefined}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-publishing">
        <DialogHeader>
          <DialogTitle>
            {allComplete ? 'Publishing Complete' : 'Publishing...'}
          </DialogTitle>
          <DialogDescription>
            {allComplete
              ? 'Your content has been published to selected platforms.'
              : 'Please wait while we publish your content.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completed} / {total}</span>
            </div>
            <Progress value={progress} data-testid="progress-publishing" />
          </div>

          <div className="space-y-3">
            {platforms.map((platform) => {
              const platformStatus = status[platform];
              return (
                <div
                  key={platform}
                  className="flex items-center gap-3 p-3 rounded-md border"
                  data-testid={`status-${platform}`}
                >
                  {getPlatformIcon(platform)}
                  <span className="flex-1 text-sm font-medium">
                    {getPlatformName(platform)}
                  </span>
                  {platformStatus === 'pending' && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {platformStatus === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                  {platformStatus === 'error' && (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Zap, BarChart3, Lock } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { RiTwitterXFill } from "react-icons/ri";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" data-testid="logo-icon" />
            <span className="text-xl font-semibold" data-testid="text-brand-name">SocialSync</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
                Publish to All Your Social Platforms in One Click
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground" data-testid="text-hero-subtitle">
                Streamline your social media workflow. Compose once, publish everywhere. 
                Manage LinkedIn, X, and Facebook from one unified dashboard.
              </p>
              <div className="pt-4">
                <Button size="lg" asChild data-testid="button-get-started">
                  <a href="/api/login">Get Started Free</a>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 pt-8" data-testid="platform-icons">
                <SiLinkedin className="w-8 h-8 text-[#0A66C2]" aria-label="LinkedIn" />
                <RiTwitterXFill className="w-8 h-8" aria-label="X (Twitter)" />
                <SiFacebook className="w-8 h-8 text-[#1877F2]" aria-label="Facebook" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 space-y-4" data-testid="card-feature-1">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Multi-Platform Publishing</h3>
                <p className="text-sm text-muted-foreground">
                  Post to LinkedIn, X, and Facebook simultaneously with a single click.
                </p>
              </Card>

              <Card className="p-6 space-y-4" data-testid="card-feature-2">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Smart Previews</h3>
                <p className="text-sm text-muted-foreground">
                  See exactly how your content will appear on each platform before publishing.
                </p>
              </Card>

              <Card className="p-6 space-y-4" data-testid="card-feature-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Post History</h3>
                <p className="text-sm text-muted-foreground">
                  Track all your published content with detailed history and status tracking.
                </p>
              </Card>

              <Card className="p-6 space-y-4" data-testid="card-feature-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Secure OAuth</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your accounts securely with industry-standard OAuth 2.0 authentication.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to streamline your social media?</h2>
            <p className="text-lg text-muted-foreground">
              Join marketers and creators who save hours every week with SocialSync.
            </p>
            <Button size="lg" asChild data-testid="button-cta-bottom">
              <a href="/api/login">Start Publishing Now</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground" data-testid="text-footer">
            &copy; 2025 SocialSync. Streamline your social media management.
          </p>
        </div>
      </footer>
    </div>
  );
}

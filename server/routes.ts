// Referenced from javascript_log_in_with_replit blueprint
import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import { insertPostSchema, insertConnectedAccountSchema, type Platform } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Connected accounts routes
  app.get("/api/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getConnectedAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch connected accounts" });
    }
  });

  app.post("/api/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConnectedAccountSchema.parse({
        ...req.body,
        userId,
      });
      
      const account = await storage.createConnectedAccount(validatedData);
      res.status(201).json(account);
    } catch (error: any) {
      console.error("Error creating account:", error);
      res.status(400).json({ message: error.message || "Failed to create connected account" });
    }
  });

  app.delete("/api/accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify the account belongs to the user
      const account = await storage.getConnectedAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      if (account.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteConnectedAccount(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Posts routes
  app.get("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userPosts = await storage.getPosts(userId);
      res.json(userPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts/publish", isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, platforms: platformsJson } = req.body;
      const imageFile = req.file;

      if (!content || !platformsJson) {
        return res.status(400).json({ message: "Content and platforms are required" });
      }

      let platforms: Platform[];
      try {
        platforms = JSON.parse(platformsJson);
      } catch (e) {
        return res.status(400).json({ message: "Invalid platforms format" });
      }

      if (!Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({ message: "At least one platform must be selected" });
      }

      // Get connected accounts for validation
      const connectedAccounts = await storage.getConnectedAccounts(userId);
      const activePlatforms = connectedAccounts
        .filter(a => a.isActive)
        .map(a => a.platform);

      // Verify user has accounts for all selected platforms
      for (const platform of platforms) {
        if (!activePlatforms.includes(platform)) {
          return res.status(400).json({ 
            message: `You don't have a connected ${platform} account` 
          });
        }
      }

      // Handle image upload (in a real app, upload to cloud storage)
      let imageUrl: string | null = null;
      if (imageFile) {
        // For demo purposes, we'll store as base64 data URL
        // In production, upload to S3/Cloudinary/etc
        const base64 = imageFile.buffer.toString('base64');
        imageUrl = `data:${imageFile.mimetype};base64,${base64}`;
      }

      // Create post record
      const post = await storage.createPost({
        userId,
        content,
        imageUrl,
        platforms,
        status: 'published', // Simplified - assume all succeed
      });

      // Simulate publishing to each platform
      // In a real app, this would call actual platform APIs
      const publishingPromises = platforms.map(async (platform) => {
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Here you would:
          // 1. Get the connected account for this platform
          // 2. Use the access token to call the platform's API
          // 3. Handle platform-specific formatting
          
          const account = connectedAccounts.find(a => a.platform === platform);
          
          // Simulate successful publish
          await storage.createPublishingResult({
            postId: post.id,
            platform,
            status: 'success',
            platformPostId: `${platform}_${Date.now()}`,
            platformPostUrl: `https://${platform}.com/post/${Date.now()}`,
          });
          
          return { platform, success: true };
        } catch (error: any) {
          // Handle publishing failure
          await storage.createPublishingResult({
            postId: post.id,
            platform,
            status: 'failed',
            errorMessage: error.message || 'Publishing failed',
          });
          
          return { platform, success: false, error: error.message };
        }
      });

      const results = await Promise.all(publishingPromises);
      const allSucceeded = results.every(r => r.success);
      const someSucceeded = results.some(r => r.success);

      // Update post status based on actual results and persist to database
      const finalStatus = allSucceeded ? 'published' : (someSucceeded ? 'partial' : 'failed');
      
      // Update the post status in database
      const updatedPost = await storage.updatePostStatus(post.id, finalStatus);
      
      res.status(201).json({
        post: updatedPost || post,
        results,
        status: finalStatus,
      });
    } catch (error: any) {
      console.error("Error publishing post:", error);
      res.status(500).json({ message: error.message || "Failed to publish post" });
    }
  });

  // Demo: Create a connected account for testing (simulates OAuth flow)
  app.post("/api/accounts/connect-demo/:platform", isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if account already exists
      const existingAccounts = await storage.getConnectedAccounts(userId);
      const existing = existingAccounts.find(a => a.platform === platform && a.isActive);
      
      if (existing) {
        return res.status(400).json({ message: "Account already connected" });
      }
      
      // Create demo account
      const demoAccount = await storage.createConnectedAccount({
        userId,
        platform,
        accountId: `demo_${platform}_${Date.now()}`,
        accountName: `Demo ${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        accountProfileUrl: null,
        accessToken: `demo_token_${platform}_${Date.now()}`,
        refreshToken: null,
        tokenExpiresAt: null,
        isActive: true,
      });
      
      res.status(201).json(demoAccount);
    } catch (error: any) {
      console.error("Error creating demo account:", error);
      res.status(500).json({ message: error.message || "Failed to connect account" });
    }
  });

  // OAuth callback endpoints for social platforms
  // These would be implemented with platform-specific OAuth flows
  app.get("/api/oauth/:platform/callback", isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      const userId = req.user.claims.sub;
      
      // In a real implementation, this would:
      // 1. Exchange authorization code for access token
      // 2. Get user profile from the platform
      // 3. Store the account connection
      
      res.redirect('/accounts?connected=' + platform);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect('/accounts?error=oauth_failed');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

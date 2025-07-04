import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  integration?: any;
}

export function apiKeyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({ 
      error: "API key required", 
      message: "Please provide a valid API key in the X-API-Key header" 
    });
  }

  // In a real implementation, you would validate the API key against the database
  // For now, we'll accept any non-empty API key
  req.apiKey = apiKey;
  next();
}

export function validateWebhookSignature(req: Request, res: Response, next: NextFunction) {
  // In a real implementation, you would validate webhook signatures
  // This is a placeholder for webhook security
  next();
}

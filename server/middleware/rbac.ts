import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  HR_RECRUITER = 'hr_recruiter', 
  SUPPORT_REVIEWER = 'support_reviewer',
  CANDIDATE = 'candidate'
}

export enum Permission {
  // Job Management
  CREATE_JOBS = 'create_jobs',
  VIEW_JOBS = 'view_jobs',
  EDIT_JOBS = 'edit_jobs',
  DELETE_JOBS = 'delete_jobs',
  
  // Candidate Management
  VIEW_CANDIDATES = 'view_candidates',
  EDIT_CANDIDATES = 'edit_candidates',
  DELETE_CANDIDATES = 'delete_candidates',
  
  // Interview Management
  VIEW_INTERVIEWS = 'view_interviews',
  CONDUCT_INTERVIEWS = 'conduct_interviews',
  SCORE_INTERVIEWS = 'score_interviews',
  OVERRIDE_SCORES = 'override_scores',
  
  // Analytics & Reporting
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_ADVANCED_ANALYTICS = 'view_advanced_analytics',
  EXPORT_REPORTS = 'export_reports',
  VIEW_BIAS_ANALYSIS = 'view_bias_analysis',
  
  // System Administration
  MANAGE_USERS = 'manage_users',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  
  // API Access
  API_ACCESS = 'api_access',
  WEBHOOK_ACCESS = 'webhook_access'
}

// Define role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    ...Object.values(Permission)
  ],
  
  [UserRole.HR_RECRUITER]: [
    // Job management
    Permission.CREATE_JOBS,
    Permission.VIEW_JOBS,
    Permission.EDIT_JOBS,
    
    // Candidate management
    Permission.VIEW_CANDIDATES,
    Permission.EDIT_CANDIDATES,
    
    // Interview management
    Permission.VIEW_INTERVIEWS,
    Permission.SCORE_INTERVIEWS,
    Permission.OVERRIDE_SCORES,
    
    // Analytics
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_ADVANCED_ANALYTICS,
    Permission.EXPORT_REPORTS,
    
    // Limited system access
    Permission.MANAGE_INTEGRATIONS
  ],
  
  [UserRole.SUPPORT_REVIEWER]: [
    // Review and override capabilities
    Permission.VIEW_JOBS,
    Permission.VIEW_CANDIDATES,
    Permission.VIEW_INTERVIEWS,
    Permission.SCORE_INTERVIEWS,
    Permission.OVERRIDE_SCORES,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_BIAS_ANALYSIS
  ],
  
  [UserRole.CANDIDATE]: [
    // Minimal access for candidates
    Permission.CONDUCT_INTERVIEWS
  ]
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Mock user data - in production this would come from database/auth service
const MOCK_USERS: Record<string, AuthenticatedUser> = {
  'admin@company.com': {
    id: '1',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.ADMIN]
  },
  'hr@company.com': {
    id: '2', 
    email: 'hr@company.com',
    role: UserRole.HR_RECRUITER,
    permissions: ROLE_PERMISSIONS[UserRole.HR_RECRUITER]
  },
  'reviewer@company.com': {
    id: '3',
    email: 'reviewer@company.com',
    role: UserRole.SUPPORT_REVIEWER,
    permissions: ROLE_PERMISSIONS[UserRole.SUPPORT_REVIEWER]
  }
};

// Middleware to simulate user authentication
export function simulateAuth(req: Request, res: Response, next: NextFunction) {
  // In development, simulate admin user
  const mockEmail = req.headers['x-mock-user'] as string || 'admin@company.com';
  const user = MOCK_USERS[mockEmail];
  
  if (user) {
    req.user = user;
  } else {
    // Default to HR role for unknown users
    req.user = {
      id: 'default',
      email: mockEmail,
      role: UserRole.HR_RECRUITER,
      permissions: ROLE_PERMISSIONS[UserRole.HR_RECRUITER]
    };
  }
  
  next();
}

// Permission checking middleware
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: permission,
        userRole: req.user.role 
      });
    }
    
    next();
  };
}

// Role checking middleware
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: 'Insufficient role', 
        required: role,
        userRole: req.user.role 
      });
    }
    
    next();
  };
}

// Multiple permission checking
export function requireAnyPermission(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: permissions,
        userRole: req.user.role 
      });
    }
    
    next();
  };
}

// Utility function to check permissions programmatically
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

// Utility to get user capabilities for frontend
export function getUserCapabilities(user: AuthenticatedUser) {
  return {
    role: user.role,
    permissions: user.permissions,
    canManageJobs: hasPermission(user, Permission.CREATE_JOBS),
    canViewAnalytics: hasPermission(user, Permission.VIEW_ANALYTICS),
    canOverrideScores: hasPermission(user, Permission.OVERRIDE_SCORES),
    canManageUsers: hasPermission(user, Permission.MANAGE_USERS),
    canViewBiasAnalysis: hasPermission(user, Permission.VIEW_BIAS_ANALYSIS),
    canExportReports: hasPermission(user, Permission.EXPORT_REPORTS)
  };
}
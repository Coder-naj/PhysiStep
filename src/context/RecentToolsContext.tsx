import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  PhysicsToolDefinition, 
  RecentToolRecord, 
  PHYSICS_SOLVER_TOOLS, 
  getPhysicsToolById,
  TabType 
} from '../types/recentTools';

interface NavigationTarget {
  tab: TabType;
  subtopic?: string;
}

interface RecentToolsContextType {
  recentTools: RecentToolRecord[];
  logToolAccess: (toolId: string) => void;
  removeRecentTool: (toolId: string) => void;
  clearRecentTools: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  toggleDropdown: () => void;
  onNavigateToTool?: (target: NavigationTarget) => void;
  setNavigationHandler: (handler: (target: NavigationTarget) => void) => void;
  triggerNavigate: (tool: PhysicsToolDefinition) => void;
}

const STORAGE_KEY = 'physistep_recent_tools_v1';
const MAX_RECENT_COUNT = 20;

// Default initial recent tools to provide instant value upon initial launch
const INITIAL_DEFAULT_IDS = [
  'motion_1d',
  'force_flat',
  'energy_conservation',
  'motion_projectile',
  'energy_power',
  'ai_solver',
  'force_incline',
  'energy_work',
  'unit_speed',
  'quiz_practice'
];

function getInitialRecentTools(): RecentToolRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: RecentToolRecord[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Hydrate from definitions in case any text/formula was updated
        return parsed.slice(0, MAX_RECENT_COUNT).map((item) => {
          const fresh = getPhysicsToolById(item.id);
          return fresh
            ? { ...fresh, lastAccessed: item.lastAccessed || Date.now() }
            : item;
        });
      }
    }
  } catch (err) {
    console.error('Failed to load recent tools from localStorage:', err);
  }

  // Seed default items with staggered timestamps
  const now = Date.now();
  const seeded: RecentToolRecord[] = [];
  INITIAL_DEFAULT_IDS.forEach((id, index) => {
    const tool = getPhysicsToolById(id);
    if (tool) {
      seeded.push({
        ...tool,
        // Stagger access times: 2 min, 10 min, 30 min, 1 hour, etc.
        lastAccessed: now - index * 1000 * 60 * 5,
      });
    }
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch (err) {
    console.error('Failed to seed initial recent tools to localStorage:', err);
  }

  return seeded;
}

const RecentToolsContext = createContext<RecentToolsContextType | undefined>(undefined);

export const RecentToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentTools, setRecentTools] = useState<RecentToolRecord[]>(getInitialRecentTools);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [navigationHandler, setNavigationHandlerState] = useState<((target: NavigationTarget) => void) | null>(null);

  const setNavigationHandler = useCallback((handler: (target: NavigationTarget) => void) => {
    setNavigationHandlerState(() => handler);
  }, []);

  // Save to localStorage whenever recentTools changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentTools));
    } catch (err) {
      console.error('Failed to persist recent tools:', err);
    }
  }, [recentTools]);

  const logToolAccess = useCallback((toolId: string) => {
    const toolDef = getPhysicsToolById(toolId);
    if (!toolDef) return;

    setRecentTools((prev) => {
      // Remove any existing entry for this tool
      const filtered = prev.filter((item) => item.id !== toolId);
      const newRecord: RecentToolRecord = {
        ...toolDef,
        lastAccessed: Date.now(),
      };
      // Insert at the front, keep at most 20 items
      return [newRecord, ...filtered].slice(0, MAX_RECENT_COUNT);
    });
  }, []);

  const removeRecentTool = useCallback((toolId: string) => {
    setRecentTools((prev) => prev.filter((item) => item.id !== toolId));
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear recent tools storage:', err);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
    if (isDropdownOpen) setIsDropdownOpen(false);
  }, [isDropdownOpen]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const triggerNavigate = useCallback((tool: PhysicsToolDefinition) => {
    logToolAccess(tool.id);
    if (navigationHandler) {
      navigationHandler({
        tab: tool.tab,
        subtopic: tool.subtopic,
      });
    }
    setIsDropdownOpen(false);
    setIsSidebarOpen(false);
  }, [logToolAccess, navigationHandler]);

  return (
    <RecentToolsContext.Provider
      value={{
        recentTools,
        logToolAccess,
        removeRecentTool,
        clearRecentTools,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isDropdownOpen,
        setIsDropdownOpen,
        toggleDropdown,
        onNavigateToTool: navigationHandler || undefined,
        setNavigationHandler,
        triggerNavigate,
      }}
    >
      {children}
    </RecentToolsContext.Provider>
  );
};

export const useRecentTools = (): RecentToolsContextType => {
  const context = useContext(RecentToolsContext);
  if (!context) {
    throw new Error('useRecentTools must be used within a RecentToolsProvider');
  }
  return context;
};

// Utility to format relative timestamps
export function formatRelativeTime(timestamp: number, isBangla: boolean = false): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 60) {
    return isBangla ? 'এইমাত্র' : 'Just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return isBangla ? `${diffMin} মিনিট আগে` : `${diffMin}m ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return isBangla ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return isBangla ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
}

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { useProjects } from "@/hooks/use-projects";
import { useAllSpaces } from "@/hooks/use-all-spaces";
import { useConversations } from "@/hooks/use-messages";
import { useCurrentAuthUser } from "@/hooks/use-auth";
import { CreateSpaceFromSidebarModal } from "@/components/molecules/create-space-from-sidebar-modal";
import { NewConversationModal } from "@/components/molecules/new-conversation-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  DollarSign,
  BarChart3,
  FileText,
  Plus,
  ChevronDown,
  Users,
  Settings,
  FolderKanban,
  CheckSquare2,
  MoreHorizontal,
  Network,
  Hash,
  MessageSquare,
  Target,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  taskCount?: number;
  icon?: "check" | "document";
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { spaces, isLoading: spacesLoading } = useAllSpaces();
  const {
    conversations,
    isLoading: isLoadingConversations,
    createConversation,
    isCreating: isCreatingConversation,
  } = useConversations();
  const { user: currentUser } = useCurrentAuthUser();
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  
  // Auto-expand Team Space if on a project route
  const isOnProjectRoute = pathname?.startsWith("/projects/");
  const [expandedItems, setExpandedItems] = useState<string[]>(
    isOnProjectRoute ? ["team space"] : []
  );
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number; left: number } | null>(null);
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Create navigation items
  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      label: "Projects",
      icon: <FolderKanban className="h-5 w-5" />,
      href: "/projects",
    },
    {
      label: "Sprints",
      icon: <Target className="h-5 w-5" />,
      href: "/sprints",
    },
    {
      label: "Financial Management",
      icon: <DollarSign className="h-5 w-5" />,
      href: "/costs",
    },
    {
      label: "Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/reports/financial",
    },
    {
      label: "Contracts",
      icon: <FileText className="h-5 w-5" />,
      href: "/contracts",
    },
  ];

  // Group projects by space
  const projectsBySpace = useMemo(() => {
    const map: Record<string, typeof projects> = {};
    projects.forEach((project) => {
      const spaceId = (project as any).spaceId || (project as any).teamSpace?.id;
      if (spaceId) {
        if (!map[spaceId]) {
          map[spaceId] = [];
        }
        map[spaceId].push(project);
      }
    });
    return map;
  }, [projects]);

  // Projects without spaces
  const projectsWithoutSpaces = useMemo(() => {
    return projects.filter((project) => {
      const spaceId = (project as any).spaceId || (project as any).teamSpace?.id;
      return !spaceId;
    });
  }, [projects]);

  // Transform backend projects to sidebar format
  const sidebarProjects: Project[] = projects.map((project) => ({
    id: project.uid,
    name: project.name,
    description: project.description || undefined,
    taskCount: project.tasks?.length || 0,
    icon: "check" as const,
  }));

  // Transform conversations for sidebar display
  const displayConversations = useMemo(() => {
    if (!conversations || conversations.length === 0) return [];

    const currentUserId = currentUser?.id;

    return conversations
      .filter((conv) => !conv.isArchived)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .map((conv) => {
        if (conv.type === "direct" && currentUserId) {
          const otherParticipant = conv.participants.find((p) => p.id !== currentUserId);
          if (otherParticipant) {
            return {
              id: conv.id,
              name: otherParticipant.name,
              avatar: otherParticipant.avatar,
              status: otherParticipant.status,
              unreadCount: conv.unreadCount,
              lastMessage: conv.lastMessage,
            };
          }
        }
        
        return {
          id: conv.id,
          name: conv.name,
          avatar: conv.avatar,
          status: "offline" as const,
          unreadCount: conv.unreadCount,
          lastMessage: conv.lastMessage,
        };
      });
  }, [conversations, currentUser?.id]);

  // Update flyout position on scroll/resize
  useEffect(() => {
    if (collapsed && hoveredItem && flyoutPosition) {
      const updatePosition = () => {
        const buttonElement = itemRefs.current[hoveredItem];
        if (buttonElement) {
          const rect = buttonElement.getBoundingClientRect();
          setFlyoutPosition({
            top: rect.top,
            left: rect.right + 8,
          });
        }
      };

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [collapsed, hoveredItem, flyoutPosition]);

  const toggleExpand = (itemLabel: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemLabel.toLowerCase())
        ? prev.filter((i) => i !== itemLabel.toLowerCase())
        : [...prev, itemLabel.toLowerCase()]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
    }
    if (href === "/projects") {
      return pathname === "/projects" || pathname?.startsWith("/projects/");
    }
    if (pathname === href) {
      return true;
    }
    if (pathname?.startsWith(`${href}/`)) {
      return true;
    }
    return false;
  };

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      toggleExpand(item.label);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleProjectClick = (projectUid: string) => {
    router.push(`/projects/${projectUid}`);
  };

  const isProjectActive = (projectUid: string) => {
    return pathname === `/projects/${projectUid}`;
  };

  const updateFlyoutPosition = (itemKey: string) => {
    const buttonElement = itemRefs.current[itemKey];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      setFlyoutPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  };

  const handleItemHover = (itemKey: string, hasChildren: boolean | undefined) => {
    if (collapsed && hasChildren) {
      setHoveredItem(itemKey);
      setTimeout(() => updateFlyoutPosition(itemKey), 0);
    } else if (!collapsed) {
      setHoveredItem(itemKey);
    }
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const itemKey = item.label.toLowerCase();
    const isExpanded = expandedItems.includes(itemKey);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);
    const hasActiveChild = hasChildren && item.children?.some(child => isActive(child.href));
    const isHovered = hoveredItem === itemKey;

    return (
      <div 
        key={itemKey}
        onMouseEnter={() => handleItemHover(itemKey, hasChildren)}
        onMouseLeave={(e) => {
          if (collapsed) {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!relatedTarget || !relatedTarget.closest('[class*="fixed"]')) {
              setTimeout(() => {
                if (hoveredItem !== itemKey) {
                  setHoveredItem(null);
                  setFlyoutPosition(null);
                }
              }, 150);
            }
          } else {
            setHoveredItem(null);
          }
        }}
      >
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                ref={(el) => {
                  itemRefs.current[itemKey] = el;
                }}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  "transition-all duration-300 ease-out",
                  "hover:bg-primary/5 hover:translate-x-1",
                  (active || hasActiveChild) && "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:translate-x-0",
                  collapsed && "justify-center px-0 py-3 hover:translate-x-0",
                  level > 0 && "ml-4 pl-6"
                )}
              >
                <span className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  collapsed && "mx-auto",
                  (active || hasActiveChild) ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                )}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className={cn(
                      "flex-1 text-left transition-colors duration-300",
                      (active || hasActiveChild) ? "text-primary-foreground" : "text-foreground/80 group-hover:text-primary"
                    )}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge 
                        variant={active || hasActiveChild ? "outline" : "primary"} 
                        className={cn(
                          "h-5 min-w-5 px-1.5 text-[10px] font-black border-none shadow-sm",
                          (active || hasActiveChild) && "bg-white/20 text-white"
                        )}
                      >
                        {item.badge > 9 ? "9+" : item.badge}
                      </Badge>
                    )}
                    {hasChildren && (
                      <span className={cn(
                        "flex-shrink-0 transition-transform duration-300",
                        isExpanded && "rotate-180",
                        (active || hasActiveChild) ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    )}
                  </>
                )}
                {/* Active Indicator Dot */}
                {(active || hasActiveChild) && collapsed && (
                  <motion.div 
                    layoutId="activeDot"
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 bg-primary rounded-r-full shadow-[2px_0_8px_rgba(var(--primary),0.4)]"
                  />
                )}
              </button>
            </TooltipTrigger>
            {collapsed && !hasChildren && (
              <TooltipContent 
                side="right" 
                className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl px-3 py-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {item.badge} {item.badge === 1 ? "notification" : "notifications"}
                    </span>
                  )}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Render children when expanded */}
        {!collapsed && hasChildren && (
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
          )}>
            <div className="space-y-0.5 pt-1">
              {item.children?.map((child) => {
                const childActive = isActive(child.href);
                const childKey = `${itemKey}-${child.label.toLowerCase()}`;
                return (
                  <button
                    key={childKey}
                    onClick={() => child.href && router.push(child.href)}
                    className={cn(
                      "group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                      "transition-all duration-200",
                      "hover:bg-primary/5",
                      childActive ? "bg-primary/10 text-primary font-semibold" : "",
                      childActive ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-primary before:rounded-r-full" : "",
                      "ml-4 pl-6"
                    )}
                  >
                    <span className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-px bg-border/60",
                      childActive && "bg-primary/30"
                    )} />
                    <span className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      childActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )}>
                      {child.icon}
                    </span>
                    <span className={cn(
                      "flex-1 text-left transition-colors duration-200",
                      childActive ? "text-primary" : "text-foreground/90"
                    )}>
                      {child.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hover flyout for collapsed sidebar */}
        {collapsed && hasChildren && isHovered && flyoutPosition && (
          <div 
            className="fixed z-50 w-56 rounded-xl border border-border/40 bg-popover/95 backdrop-blur-sm shadow-2xl animate-fade-in overflow-hidden"
            style={{
              top: `${flyoutPosition.top}px`,
              left: `${flyoutPosition.left}px`,
              isolation: 'isolate',
            }}
            onMouseEnter={() => {
              setHoveredItem(itemKey);
              updateFlyoutPosition(itemKey);
            }}
            onMouseLeave={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (!relatedTarget || !relatedTarget.closest('.flyout-menu-item')) {
                setTimeout(() => {
                  if (hoveredItem !== itemKey) {
                    setHoveredItem(null);
                    setFlyoutPosition(null);
                  }
                }, 200);
              }
            }}
          >
            <div className="p-1.5">
              <div className="px-3 py-2 mb-1 border-b border-border/40">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {item.children?.map((child) => {
                  const childActive = isActive(child.href);
                  const childKey = `${itemKey}-${child.label.toLowerCase()}`;
                  return (
                    <button
                      key={childKey}
                      className={cn(
                        "flyout-menu-item relative w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
                        "hover:bg-primary/10 hover:text-primary",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                        childActive && "bg-primary/10 text-primary font-semibold"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (child.href) {
                          router.push(child.href);
                          setTimeout(() => {
                            setHoveredItem(null);
                            setFlyoutPosition(null);
                          }, 300);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseEnter={() => {
                        setHoveredItem(itemKey);
                        updateFlyoutPosition(itemKey);
                      }}
                    >
                      <span className={cn(
                        "flex-shrink-0 transition-colors",
                        childActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {child.icon}
                      </span>
                      <span className="flex-1 text-left">{child.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r border-border/40 bg-card/95 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[280px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header with Collapse Button at Top */}
        <div className={cn(
          "relative flex flex-col items-center border-b border-border/40 bg-gradient-to-br from-card to-card/50",
          collapsed ? "px-0 py-3 gap-2" : "px-4 py-4"
        )}>
          {/* Collapse Button - At Top Above Logo */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all duration-200 flex-shrink-0 z-10",
                    "bg-background hover:bg-primary/10 hover:text-primary",
                    "border border-border/40 shadow-md",
                    "hover:scale-110 active:scale-95",
                    collapsed ? "mb-1" : "absolute top-2 right-2"
                  )}
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl"
              >
                <span className="text-sm">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 min-w-0 flex-1 w-full"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-primary/10">
                <img 
                  src="/Artboard1.svg" 
                  alt="Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base truncate text-foreground">
                  Nest Blue
                </span>
                <span className="text-xs text-muted-foreground">Project Management</span>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center w-full"
            >
              <div className="relative flex items-center justify-center p-2 rounded-xl bg-primary/5 ring-2 ring-primary/10">
                <img 
                  src="/Artboard1.svg" 
                  alt="Logo" 
                  className="h-8 w-8 object-contain"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Search */}
        <div className="border-b border-border/40 p-3">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  {collapsed ? (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-10 w-full items-center justify-center rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/80 transition-all duration-200 border border-border/40"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Input
                        placeholder="Search..."
                        leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                        variant="filled"
                        className="w-full h-10 border-border/40"
                        readOnly
                        onClick={() => router.push("/search")}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                          <span className="text-xs">⌘</span>
                        </kbd>
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                          K
                        </kbd>
                      </div>
                    </motion.div>
                  )}
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent 
                  side="right" 
                  className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Search</span>
                    <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted px-1.5 font-mono text-[10px] font-medium">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="mb-6">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 px-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  MAIN
                </span>
              </motion.div>
            )}
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: collapsed ? 0 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {renderNavItem(item)}
              </motion.div>
            ))}
          </nav>

          {/* Spaces Section */}
          <div className="mt-8">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex items-center justify-between px-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  SPACES
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsCreateSpaceModalOpen(true)}
                  className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* All Tasks Item */}
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push("/tasks")}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  "transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  isActive("/tasks") && "bg-primary/10 text-primary shadow-sm",
                  isActive("/tasks") && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-primary before:rounded-r-full",
                  "text-left relative"
                )}
              >
                <Network className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive("/tasks") ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="flex-1 truncate">
                  All Tasks
                </span>
              </motion.button>
            )}

            {/* Team Space Expandable Item */}
            <div 
              className="mt-1"
              onMouseEnter={() => {
                if (collapsed) {
                  setHoveredItem("team space");
                  requestAnimationFrame(() => {
                    const buttonElement = itemRefs.current["team space"];
                    if (buttonElement) {
                      const rect = buttonElement.getBoundingClientRect();
                      setFlyoutPosition({
                        top: rect.top,
                        left: rect.right + 8,
                      });
                    }
                  });
                }
              }}
              onMouseLeave={() => {
                if (collapsed) {
                  setTimeout(() => {
                    if (hoveredItem !== "team space") {
                      setHoveredItem(null);
                      setFlyoutPosition(null);
                    }
                  }, 150);
                }
              }}
            >
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                        "hover:bg-primary/10 hover:text-primary",
                        expandedItems.includes("team space") && "bg-primary/10 text-primary",
                        collapsed && "justify-center px-0 py-2.5"
                      )}
                    >
                      <button
                        ref={(el) => {
                          itemRefs.current["team space"] = el;
                        }}
                        onClick={() => toggleExpand("team space")}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <Users className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                          collapsed && "mx-auto",
                          expandedItems.includes("team space") ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                        {!collapsed && (
                          <>
                            <span className={cn(
                              "flex-1 transition-colors duration-200",
                              expandedItems.includes("team space") ? "text-primary font-semibold" : "text-foreground"
                            )}>
                              Team Space
                            </span>
                            <span className={cn(
                              "flex-shrink-0 transition-transform duration-200",
                              expandedItems.includes("team space") && "rotate-180"
                            )}>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </>
                        )}
                      </button>
                      {!collapsed && (
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setIsCreateSpaceModalOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {collapsed && !(hoveredItem === "team space") && (
                    <TooltipContent 
                      side="right" 
                      className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl"
                    >
                      <span className="font-semibold text-sm">Team Space</span>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Expanded Spaces List */}
              {!collapsed && (
                <AnimatePresence>
                  {expandedItems.includes("team space") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        {spaces.length > 0 && (
                          <div className="space-y-1">
                            {spaces.map((space: any) => {
                              const spaceProjects = projectsBySpace[space.id] || [];
                              
                              return (
                                <div key={space.id} className="space-y-0.5">
                                  <div className="px-3 py-1.5 flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-foreground truncate">
                                      {space.name}
                                    </span>
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 ml-auto">
                                      {spaceProjects.length}
                                    </Badge>
                                  </div>
                                  {spaceProjects.length > 0 ? (
                                    <div className="ml-4 space-y-0.5">
                                      {spaceProjects.map((project) => {
                                        const active = isProjectActive(project.uid);
                                        return (
                                          <button
                                            key={project.uid}
                                            onClick={() => handleProjectClick(project.uid)}
                                            className={cn(
                                              "group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                                              "transition-all duration-200",
                                              "hover:bg-primary/5",
                                              active && "bg-primary/10 text-primary font-semibold",
                                              active && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-primary before:rounded-r-full"
                                            )}
                                          >
                                            <span className={cn(
                                              "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-px bg-border/60",
                                              active && "bg-primary/30"
                                            )} />
                                            {project.icon === "check" ? (
                                              <CheckSquare2 className={cn(
                                                "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                                                active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                              )} />
                                            ) : (
                                              <FileText className={cn(
                                                "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                                                active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                              )} />
                                            )}
                                            <span className={cn(
                                              "flex-1 text-left truncate transition-colors duration-200",
                                              active ? "text-primary" : "text-foreground/90"
                                            )}>
                                              {project.name}
                                            </span>
                                            {project.taskCount !== undefined && (
                                              <span className={cn(
                                                "text-xs flex-shrink-0 font-medium px-1.5 py-0.5 rounded-md transition-colors",
                                                active 
                                                  ? "text-primary/80 bg-primary/10" 
                                                  : "text-muted-foreground bg-muted/50"
                                              )}>
                                                {project.taskCount}
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="ml-4 px-2 py-1 text-xs text-muted-foreground italic">
                                      No projects
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {projectsWithoutSpaces.length > 0 && (
                          <div className="space-y-1">
                            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Without Spaces ({projectsWithoutSpaces.length})
                            </div>
                            {projectsWithoutSpaces.map((project) => {
                              const active = isProjectActive(project.uid);
                              return (
                                <button
                                  key={project.uid}
                                  onClick={() => handleProjectClick(project.uid)}
                                  className={cn(
                                    "group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                                    "transition-all duration-200",
                                    "hover:bg-primary/5",
                                    active && "bg-primary/10 text-primary font-semibold",
                                    active && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-primary before:rounded-r-full",
                                    "ml-4 pl-6"
                                  )}
                                >
                                  <span className={cn(
                                    "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-px bg-border/60",
                                    active && "bg-primary/30"
                                  )} />
                                  {project.icon === "check" ? (
                                    <CheckSquare2 className={cn(
                                      "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                                      active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                  ) : (
                                    <FileText className={cn(
                                      "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                                      active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                  )}
                                  <span className={cn(
                                    "flex-1 text-left truncate transition-colors duration-200",
                                    active ? "text-primary" : "text-foreground/90"
                                  )}>
                                    {project.name}
                                  </span>
                                  {project.taskCount !== undefined && (
                                    <span className={cn(
                                      "text-xs flex-shrink-0 font-medium px-1.5 py-0.5 rounded-md transition-colors",
                                      active 
                                        ? "text-primary/80 bg-primary/10" 
                                        : "text-muted-foreground bg-muted/50"
                                    )}>
                                      {project.taskCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {spaces.length === 0 && projectsWithoutSpaces.length === 0 && !projectsLoading && !spacesLoading && (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            No spaces or projects yet
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Hover flyout for collapsed sidebar */}
              {collapsed && hoveredItem === "team space" && flyoutPosition && (
                <div 
                  className="fixed z-50 w-56 rounded-xl border border-border/40 bg-popover/95 backdrop-blur-sm shadow-2xl animate-fade-in overflow-hidden"
                  style={{
                    top: `${flyoutPosition.top}px`,
                    left: `${flyoutPosition.left}px`,
                  }}
                  onMouseEnter={() => {
                    setHoveredItem("team space");
                    updateFlyoutPosition("team space");
                  }}
                  onMouseLeave={() => {
                    setHoveredItem(null);
                    setFlyoutPosition(null);
                  }}
                >
                  <div className="p-1.5 max-h-[400px] overflow-y-auto">
                    <div className="px-3 py-2 mb-1 border-b border-border/40 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Team Space
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsCreateSpaceModalOpen(true);
                          setHoveredItem(null);
                          setFlyoutPosition(null);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {spaces.map((space: any) => {
                        const spaceProjects = projectsBySpace[space.id] || [];
                        
                        return (
                          <div key={space.id} className="space-y-1">
                            <div className="px-2 py-1 flex items-center gap-2">
                              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-semibold text-foreground truncate">
                                {space.name}
                              </span>
                              <Badge variant="outline" className="text-xs px-1 h-4 ml-auto">
                                {spaceProjects.length}
                              </Badge>
                            </div>
                            {spaceProjects.length > 0 ? (
                              <div className="ml-4 space-y-0.5">
                                {spaceProjects.map((project) => {
                                  const active = isProjectActive(project.uid);
                                  return (
                                    <button
                                      key={project.uid}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleProjectClick(project.uid);
                                        setHoveredItem(null);
                                        setFlyoutPosition(null);
                                      }}
                                      className={cn(
                                        "relative w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-all duration-200 cursor-pointer",
                                        "hover:bg-primary/10 hover:text-primary",
                                        active && "bg-primary/10 text-primary font-semibold"
                                      )}
                                    >
                                      <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span className="flex-1 text-left truncate">{project.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="ml-4 px-2 py-1 text-xs text-muted-foreground italic">
                                No projects
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {projectsWithoutSpaces.length > 0 && (
                        <div>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                            Without Spaces
                          </div>
                          {projectsWithoutSpaces.map((project) => {
                            const active = isProjectActive(project.uid);
                            return (
                              <button
                                key={project.uid}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleProjectClick(project.uid);
                                  setHoveredItem(null);
                                  setFlyoutPosition(null);
                                }}
                                className={cn(
                                  "relative w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
                                  "hover:bg-primary/10 hover:text-primary",
                                  active && "bg-primary/10 text-primary font-semibold"
                                )}
                              >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">{project.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* New Space Button */}
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsCreateSpaceModalOpen(true)}
                aria-label="Create new space"
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium mt-1",
                  "transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary hover:border-primary/20",
                  "border border-dashed border-border/40",
                  "text-muted-foreground"
                )}
              >
                <Plus className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">New Space</span>
              </motion.button>
            )}
          </div>

          {/* Messages Section */}
          <div className="mt-8">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex items-center justify-between px-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  MESSAGES
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNewConversationOpen(true)}
                  aria-label="Create new conversation"
                  className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            {collapsed && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mb-3 flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsNewConversationOpen(true)}
                        aria-label="Create new conversation"
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl"
                  >
                    <span className="font-semibold text-sm">Messages</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <div className="space-y-1">
              {isLoadingConversations ? (
                <div className="space-y-1 px-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-3 py-2",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                      {!collapsed && (
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : displayConversations.length === 0 ? (
                !collapsed && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground">No conversations yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/messages")}
                      className="mt-2 h-7 text-xs"
                    >
                      Start a conversation
                    </Button>
                  </div>
                )
              ) : (
                displayConversations.map((conversation, index) => (
                  <TooltipProvider key={conversation.id} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ opacity: 0, x: collapsed ? 0 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => router.push(`/messages?conversation=${conversation.id}`)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm relative group",
                            "transition-all duration-200",
                            "hover:bg-primary/10 hover:text-primary",
                            collapsed && "justify-center px-0 py-2.5"
                          )}
                        >
                          <div className="relative">
                            <Avatar
                              fallback={conversation.name}
                              size="sm"
                              status={conversation.status}
                              src={conversation.avatar}
                            />
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-card shadow-sm">
                                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {!collapsed && (
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-foreground/90 group-hover:text-primary transition-colors truncate font-medium text-sm">
                                  {conversation.name}
                                </span>
                                {conversation.lastMessage && (
                                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                    {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                            </div>
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent 
                          side="right" 
                          className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl max-w-[200px]"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm truncate">{conversation.name}</span>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="primary" className="h-4 px-1.5 text-[10px]">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground capitalize">
                              {conversation.status}
                            </span>
                            {conversation.lastMessage && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-border/40 bg-gradient-to-t from-card/80 to-card/50 p-4 backdrop-blur-sm">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    "transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                    collapsed && "justify-center px-0 py-2.5"
                  )}
                >
                  <div className="relative">
                    <Avatar 
                      fallback={currentUser?.name || "User"} 
                      size="sm" 
                      src={currentUser?.avatar}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
                  </div>
                  {!collapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-foreground truncate text-sm">
                          {currentUser?.name || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium truncate">
                          {currentUser?.role?.toUpperCase() || "MEMBER"}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent 
                  side="right" 
                  className="ml-2 bg-popover/95 backdrop-blur-sm border border-border/40 shadow-xl rounded-xl"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{currentUser?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{currentUser?.role?.toUpperCase() || "MEMBER"}</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Modals */}
      <CreateSpaceFromSidebarModal
        open={isCreateSpaceModalOpen}
        onOpenChange={setIsCreateSpaceModalOpen}
      />
      <NewConversationModal
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onCreate={async (data) => {
          await createConversation(data);
        }}
        isLoading={isCreatingConversation}
      />
    </aside>
  );
}

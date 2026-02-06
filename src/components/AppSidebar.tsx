import { User, Upload, FlaskConical, RefreshCw, BarChart3, ChevronLeft, ChevronRight, Zap, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Onboard", url: "/onboard", icon: User, step: 1 },
  { title: "Upload", url: "/upload", icon: Upload, step: 2 },
  { title: "Lab", url: "/lab", icon: FlaskConical, step: 3 },
  { title: "Loop", url: "/loop", icon: RefreshCw, step: 4 },
  { title: "Analytics", url: "/analytics", icon: BarChart3, step: 5 },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { signOut } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">PRMSOE</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Strategy Engine
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
            Pipeline
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        end
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        activeClassName="bg-primary/10 text-primary border-glow"
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${isActive ? 'bg-primary/20' : 'bg-secondary'}`}>
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-[10px] text-muted-foreground/60">Step {item.step}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && "Sign Out"}
        </button>
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg border border-border bg-secondary/50 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

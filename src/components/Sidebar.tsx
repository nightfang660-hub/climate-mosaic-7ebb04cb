import { MapPin, Calendar, Info, TrendingUp, Split, Layers, CloudRain, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: "forecast" | "map" | "climate" | "historical" | "comparison" | "radar" | "settings";
  onViewChange: (view: "forecast" | "map" | "climate" | "historical" | "comparison" | "radar" | "settings") => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ activeView, onViewChange, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const menuItems = [
    { id: "forecast" as const, label: "Forecast", icon: Calendar },
    { id: "map" as const, label: "Weather Map", icon: Layers },
    { id: "radar" as const, label: "Radar", icon: CloudRain },
    { id: "climate" as const, label: "Climate & AQI", icon: Info },
    { id: "historical" as const, label: "Historical Data", icon: TrendingUp },
    { id: "comparison" as const, label: "Compare Locations", icon: Split },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "relative bg-sidebar border-r border-sidebar-border p-6 space-y-6 transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-80"
      )}
    >
      {/* Collapse Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-8 z-50 bg-sidebar-accent border border-sidebar-border rounded-full p-1.5 hover:bg-sidebar-accent/80 transition-colors shadow-lg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      )}

      <div className="overflow-hidden">
        <h1 className={cn(
          "text-2xl font-bold text-foreground whitespace-nowrap transition-opacity duration-300",
          collapsed ? "opacity-0" : "opacity-100"
        )}>
          Weather Dashboard
        </h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left",
                collapsed ? "justify-center" : "",
                activeView === item.id
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={collapsed ? item.label : ""}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

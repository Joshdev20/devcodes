import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SideNavigationProps {
  className?: string;
}

export function SideNavigation({ className }: SideNavigationProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigationItems = [
    { icon: "ri-home-4-line", path: "/", label: "Home" },
    { icon: "ri-book-open-line", path: "/course", label: "Courses" },
    { icon: "ri-road-map-line", path: "/path", label: "Paths" },
    { icon: "ri-chat-3-line", path: "/community", label: "Community" },
    { icon: "ri-settings-4-line", path: "/settings", label: "Settings" },
  ];

  return (
    <div className={cn("flex md:flex-shrink-0", className)}>
      <div className="hidden md:flex md:flex-col w-20 bg-zinc-900 border-r border-zinc-800">
        <div className="flex flex-col items-center flex-1 h-0 overflow-y-auto">
          <div className="flex items-center justify-center h-16">
            <div className="p-2 bg-primary rounded-lg">
              <i className="ri-code-line text-xl text-white"></i>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6 w-full">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 mt-2 rounded-lg text-gray-300 transition-colors",
                  location === item.path
                    ? "bg-zinc-800 text-white"
                    : "hover:bg-zinc-800/50 hover:text-white"
                )}
                aria-label={item.label}
              >
                <i className={cn(item.icon, "text-xl")}></i>
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center mt-auto mb-8 w-full">
            <div className="relative w-12 h-12 mt-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-primary overflow-hidden">
                <span className="text-lg font-semibold text-white">
                  {user?.displayName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 mt-4 rounded-lg text-gray-300 hover:bg-zinc-800/50 hover:text-white"
              aria-label="Logout"
            >
              <i className="ri-logout-box-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav - shown at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800">
        <div className="flex justify-between px-4 py-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center p-2"
            >
              <i className={cn(
                item.icon, 
                "text-xl",
                location === item.path ? "text-white" : "text-gray-400"
              )}></i>
              <span className={cn(
                "text-xs mt-1",
                location === item.path ? "text-white" : "text-gray-500"
              )}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

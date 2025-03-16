import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface TopNavigationProps {
  className?: string;
}

export function TopNavigation({ className }: TopNavigationProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className={cn("relative flex-shrink-0 flex h-16 bg-zinc-900 border-b border-zinc-800", className)}>
      <div className="flex-1 flex justify-between px-4">
        <div className="flex-1 flex items-center">
          <button 
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="md:flex md:items-center ml-4">
            <h1 className="text-xl font-semibold text-white">CodePath</h1>
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium">Beta</span>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Button 
            size="icon" 
            variant="ghost" 
            className="p-2 rounded-md text-gray-400 hover:text-white"
            onClick={() => navigate("/search")}
          >
            <i className="ri-search-line text-xl"></i>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="ml-3 p-2 rounded-md text-gray-400 hover:text-white relative"
            onClick={() => navigate("/notifications")}
          >
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500"></span>
          </Button>

          {/* Mobile user avatar */}
          <div className="ml-3 relative md:hidden">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <span className="text-sm font-semibold text-white">
                  {user?.displayName?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - conditionally rendered */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 inset-x-0 z-50 md:hidden">
          <div className="bg-zinc-900 border-b border-zinc-800 py-2 shadow-lg">
            <div className="px-4 py-2">
              <div className="flex items-center border-b border-zinc-800 pb-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <span className="text-sm font-semibold text-white">
                      {user?.displayName?.charAt(0) || "U"}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.displayName}</div>
                  <div className="text-sm text-gray-400">{user?.username}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Button 
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost" 
                  className="w-full justify-start text-gray-300 hover:text-white"
                >
                  <i className="ri-user-line mr-2"></i>
                  Your Profile
                </Button>
                <Button 
                  onClick={() => {
                    navigate("/settings");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost" 
                  className="w-full justify-start text-gray-300 hover:text-white"
                >
                  <i className="ri-settings-4-line mr-2"></i>
                  Settings
                </Button>
                <Button 
                  onClick={() => {
                    navigate("/help");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost" 
                  className="w-full justify-start text-gray-300 hover:text-white"
                >
                  <i className="ri-question-line mr-2"></i>
                  Help
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

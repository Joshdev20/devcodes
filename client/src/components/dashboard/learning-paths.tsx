import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LearningPath, UserPathProgress } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function LearningPaths() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  const { data: paths, isLoading: isPathsLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"],
  });
  
  const { data: pathProgresses, isLoading: isProgressLoading } = useQuery<UserPathProgress[]>({
    queryKey: ["/api/user/path-progress"],
    enabled: !!user,
  });
  
  const isLoading = isPathsLoading || isProgressLoading;
  
  // Combine paths with progress data
  const pathsWithProgress = paths?.map(path => {
    const progress = pathProgresses?.find(p => p.pathId === path.id);
    return {
      ...path,
      progress: progress?.progress || 0,
      isActive: progress?.isActive || false,
      isCompleted: progress?.isCompleted || false,
      status: progress?.isCompleted ? "Completed" : progress?.isActive ? "Active" : "Not Started"
    };
  });
  
  const handlePathClick = (id: number) => {
    navigate(`/path/${id}`);
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Learning Paths</h3>
        <Button
          variant="link"
          className="text-sm text-primary hover:text-primary/80 font-medium"
          onClick={() => navigate("/paths")}
        >
          View All <i className="ri-arrow-right-line ml-1"></i>
        </Button>
      </div>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <div className="h-32 relative">
                <Skeleton className="h-full w-full rounded-t-lg" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          pathsWithProgress?.map(path => (
            <Card key={path.id} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-900/80 transition-colors">
              <div className="relative pb-1/2">
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${
                  path.color === 'primary' ? 'from-primary/20 to-primary/10' :
                  path.color === 'secondary' ? 'from-green-500/20 to-green-500/10' :
                  'from-amber-500/20 to-amber-500/10'
                }`}>
                  <i className={`${path.icon} text-5xl ${
                    path.color === 'primary' ? 'text-primary/60' :
                    path.color === 'secondary' ? 'text-green-500/60' :
                    'text-amber-500/60'
                  }`}></i>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    path.isActive ? 'bg-primary/20 text-primary' : 
                    path.isCompleted ? 'bg-green-500/20 text-green-500' :
                    'bg-zinc-700/40 text-gray-300'
                  }`}>
                    {path.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-white">{path.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{path.description}</p>
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-300">Progress</span>
                      </div>
                      <div>
                        <span className={`text-xs font-semibold ${
                          path.progress > 0 ? 'text-primary' : 'text-gray-400'
                        }`}>
                          {path.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-zinc-800">
                      <div 
                        style={{ width: `${path.progress}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          path.color === 'primary' ? 'bg-primary' :
                          path.color === 'secondary' ? 'bg-green-500' :
                          'bg-amber-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-400">
                    <i className="ri-time-line mr-1"></i>
                    <span>{path.durationWeeks} weeks</span>
                  </div>
                  <Button
                    size="sm"
                    variant={path.isActive ? "default" : path.isCompleted ? "outline" : "secondary"}
                    onClick={() => handlePathClick(path.id)}
                  >
                    {path.isActive ? 'Continue' : path.isCompleted ? 'Review' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

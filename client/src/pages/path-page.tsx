import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SideNavigation } from "@/components/layout/side-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuth } from "@/hooks/use-auth";
import { LearningPath, Course, UserPathProgress, UserCourseProgress, PathCourse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PathPage() {
  const [_, params] = useRoute<{ id: string }>("/path/:id");
  const [__, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const pathId = params ? parseInt(params.id) : null;
  
  // Get learning path details
  const { data: path, isLoading: isLoadingPath } = useQuery<LearningPath>({
    queryKey: [`/api/learning-paths/${pathId}`],
    enabled: !!pathId,
  });
  
  // Get user progress for this path
  const { data: pathProgress, isLoading: isLoadingProgress } = useQuery<UserPathProgress>({
    queryKey: [`/api/user/path-progress?pathId=${pathId}`],
    enabled: !!pathId && !!user,
  });
  
  // Get courses for this path
  const { data: pathCourses, isLoading: isLoadingPathCourses } = useQuery<PathCourse[]>({
    queryKey: [`/api/learning-paths/${pathId}/courses`],
    enabled: !!pathId,
  });
  
  // Get all courses
  const { data: allCourses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Get all user course progress
  const { data: allCourseProgress, isLoading: isLoadingCourseProgress } = useQuery<UserCourseProgress[]>({
    queryKey: ["/api/user/course-progress"],
    enabled: !!user,
  });
  
  // Start path mutation
  const startPathMutation = useMutation({
    mutationFn: async () => {
      if (!pathId) return null;
      
      const data = {
        pathId,
        progress: 0,
        isActive: true,
        isCompleted: false
      };
      
      const res = await apiRequest("POST", "/api/user/path-progress", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/path-progress?pathId=${pathId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/path-progress"] });
      toast({
        title: "Path activated",
        description: "You've successfully started this learning path!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start path",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleStartPath = () => {
    startPathMutation.mutate();
  };
  
  // Prepare courses with their progress data
  const coursesWithProgress = pathCourses?.map(pathCourse => {
    const courseDetails = allCourses?.find(c => c.id === pathCourse.courseId);
    const progress = allCourseProgress?.find(p => p.courseId === pathCourse.courseId);
    
    if (!courseDetails) return null;
    
    return {
      ...courseDetails,
      order: pathCourse.order,
      completedLessons: progress?.completedLessons || 0,
      isStarted: progress?.isStarted || false,
      isCompleted: progress?.isCompleted || false,
      progress: progress 
        ? Math.round((progress.completedLessons / courseDetails.totalLessons) * 100) 
        : 0,
      status: progress?.isCompleted 
        ? "Completed" 
        : progress?.isStarted 
          ? "In Progress" 
          : "Not Started"
    };
  }).filter(Boolean).sort((a, b) => a!.order - b!.order);
  
  // Find next course to continue
  const getNextCourse = () => {
    if (!coursesWithProgress) return null;
    
    // Find first course that is not completed
    const nextCourse = coursesWithProgress.find(course => !course?.isCompleted);
    return nextCourse || coursesWithProgress[0];
  };
  
  const nextCourse = getNextCourse();
  
  const handleContinuePath = () => {
    if (nextCourse) {
      navigate(`/course/${nextCourse.id}`);
    }
  };
  
  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };
  
  // Get color classes based on path color
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'from-primary/20 to-primary/10';
      case 'secondary': return 'from-green-500/20 to-green-500/10';
      case 'accent': return 'from-amber-500/20 to-amber-500/10';
      default: return 'from-primary/20 to-primary/10';
    }
  };
  
  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary/60';
      case 'secondary': return 'text-green-500/60';
      case 'accent': return 'text-amber-500/60';
      default: return 'text-primary/60';
    }
  };
  
  // Get color for progress bars and indicators
  const getCourseColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-500';
      case 'blue': return 'bg-blue-500';
      case 'cyan': return 'bg-cyan-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-primary';
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-gray-50">
      <SideNavigation />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopNavigation />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          {isLoadingPath || isLoadingProgress || isLoadingPathCourses || isLoadingCourses ? (
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-6" />
                
                <div className="bg-zinc-900 rounded-lg p-6 mb-8">
                  <div className="flex flex-col md:flex-row">
                    <Skeleton className="w-24 h-24 rounded-lg mr-6 mb-4 md:mb-0" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-9 w-40" />
                    </div>
                  </div>
                </div>
                
                <Skeleton className="h-8 w-40 mb-6" />
                
                {[1, 2, 3].map((i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : path ? (
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {/* Path Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
                    {path.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">{path.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="ml-4"
                >
                  <i className="ri-arrow-left-line mr-1"></i> Back to Dashboard
                </Button>
              </div>
              
              {/* Path Info Card */}
              <div className="bg-zinc-900 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row">
                  <div className={`flex items-center justify-center w-24 h-24 rounded-lg bg-gradient-to-br ${getColorClass(path.color)} mr-6 mb-4 md:mb-0`}>
                    <i className={`${path.icon} text-4xl ${getIconColorClass(path.color)}`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center mb-3">
                      <span className="mr-3 text-sm text-gray-400">
                        <i className="ri-time-line mr-1"></i> {path.durationWeeks} weeks
                      </span>
                      <span className="mr-3 text-sm text-gray-400">
                        <i className="ri-bar-chart-line mr-1"></i> {path.difficulty}
                      </span>
                      <span className="text-sm text-gray-400">
                        <i className="ri-book-open-line mr-1"></i> {coursesWithProgress?.length || 0} courses
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      {pathProgress ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">Overall Progress</span>
                            <span className="text-sm text-primary">{pathProgress.progress}%</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${pathProgress.progress}%` }}
                            ></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            {pathProgress.isCompleted 
                              ? "You've completed this learning path!" 
                              : "Continue learning to complete this path."}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">You haven't started this learning path yet.</p>
                      )}
                    </div>
                    
                    <div>
                      {pathProgress ? (
                        <Button onClick={handleContinuePath} className="mr-2">
                          <i className="ri-play-circle-line mr-1"></i> Continue Path
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleStartPath} 
                          disabled={startPathMutation.isPending}
                        >
                          {startPathMutation.isPending ? (
                            <>
                              <i className="ri-loader-2-line animate-spin mr-1"></i> Starting...
                            </>
                          ) : (
                            <>
                              <i className="ri-play-circle-line mr-1"></i> Start Path
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Courses in Path */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Courses in this Path</h3>
                <div className="space-y-6">
                  {coursesWithProgress?.map((course, index) => (
                    <div key={course?.id} className="relative">
                      {/* Vertical timeline line */}
                      {index < (coursesWithProgress.length - 1) && (
                        <div className="absolute left-4 top-16 bottom-0 w-0.5 bg-zinc-800"></div>
                      )}
                      
                      <Card 
                        key={course?.id} 
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => course && handleCourseClick(course.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-4">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                  {course?.isCompleted ? (
                                    <i className="ri-check-line text-green-500"></i>
                                  ) : (
                                    <span className="text-sm text-gray-400">{index + 1}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className={`mr-3 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${getColorClass(course?.color || 'primary')}`}>
                                  <i className={`${course?.icon} text-xl ${getIconColorClass(course?.color || 'primary')}`}></i>
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{course?.title}</h4>
                                  <p className="text-xs text-gray-400">{course?.description}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center">
                                    <i className="ri-book-open-line text-gray-400 mr-1"></i>
                                    <span className="text-xs text-gray-400">{course?.completedLessons}/{course?.totalLessons} lessons</span>
                                  </div>
                                  <span className={`text-xs ${course?.isCompleted ? 'text-green-500' : course?.isStarted ? 'text-primary' : 'text-gray-400'}`}>
                                    {course?.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                  <div 
                                    className={getCourseColorClass(course?.color || 'primary')}
                                    style={{ width: `${course?.progress}%`, height: '0.375rem', borderRadius: '0.5rem' }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex justify-between items-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  course?.isCompleted 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : course?.isStarted 
                                      ? 'bg-primary/20 text-primary' 
                                      : 'bg-zinc-800 text-gray-400'
                                }`}>
                                  {course?.status}
                                </span>
                                
                                <Button 
                                  size="sm" 
                                  variant={course?.isStarted && !course.isCompleted ? "default" : "secondary"}
                                >
                                  {course?.isCompleted 
                                    ? 'Review' 
                                    : course?.isStarted 
                                      ? 'Continue' 
                                      : 'Start'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 sm:px-6 lg:px-8 text-center">
              <div className="py-12">
                <i className="ri-error-warning-line text-5xl text-gray-500 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">Learning Path Not Found</h3>
                <p className="text-gray-400 mb-6">The learning path you are looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate("/")}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course, UserCourseProgress } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseList() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  const { data: courseProgresses, isLoading: isProgressLoading } = useQuery<UserCourseProgress[]>({
    queryKey: ["/api/user/course-progress"],
    enabled: !!user,
  });
  
  const isLoading = isCoursesLoading || isProgressLoading;
  
  // Combine courses with progress data
  const coursesWithProgress = courses?.map(course => {
    const progress = courseProgresses?.find(p => p.courseId === course.id);
    return {
      ...course,
      completedLessons: progress?.completedLessons || 0,
      isStarted: progress?.isStarted || false,
      isCompleted: progress?.isCompleted || false,
      progress: progress ? Math.round((progress.completedLessons / course.totalLessons) * 100) : 0,
      status: progress?.isCompleted ? "Completed" : 
              progress?.isStarted ? (progress.completedLessons > 0 ? "In Progress" : "Just Started") : 
              "Not Started"
    };
  });
  
  // Sort courses by progress status
  const sortedCourses = coursesWithProgress?.sort((a, b) => {
    // First prioritize courses in progress
    if (a.isStarted && !a.isCompleted && (!b.isStarted || b.isCompleted)) return -1;
    if (b.isStarted && !b.isCompleted && (!a.isStarted || a.isCompleted)) return 1;
    
    // Then prioritize by progress percentage (descending)
    return b.progress - a.progress;
  });
  
  // Get color for course card based on icon/theme
  const getColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'from-yellow-500/20 to-yellow-600/10';
      case 'blue': return 'from-blue-500/20 to-blue-600/10';
      case 'cyan': return 'from-cyan-500/20 to-cyan-600/10';
      case 'green': return 'from-green-500/20 to-green-600/10';
      default: return 'from-primary/20 to-primary/10';
    }
  };
  
  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'text-yellow-500/70';
      case 'blue': return 'text-blue-500/70';
      case 'cyan': return 'text-cyan-500/70';
      case 'green': return 'text-green-500/70';
      default: return 'text-primary/70';
    }
  };
  
  const getProgressColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-500';
      case 'blue': return 'bg-blue-500';
      case 'cyan': return 'bg-cyan-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-primary';
    }
  };
  
  const handleCourseClick = (id: number) => {
    navigate(`/course/${id}`);
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recommended Courses</h3>
        <Button
          variant="link"
          className="text-sm text-primary hover:text-primary/80 font-medium"
          onClick={() => navigate("/courses")}
        >
          View All <i className="ri-arrow-right-line ml-1"></i>
        </Button>
      </div>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          [...Array(4)].map((_, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <div className="h-24 relative">
                <Skeleton className="h-full w-full rounded-t-lg" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-3 w-full mt-1 mb-2" />
                <Skeleton className="h-1 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          sortedCourses?.slice(0, 4).map(course => (
            <Card 
              key={course.id}
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-900/80 transition-colors cursor-pointer overflow-hidden"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="relative pb-3/5">
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${getColorClass(course.color)}`}>
                  <i className={`${course.icon} text-4xl ${getIconColorClass(course.color)}`}></i>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white">{course.title}</h4>
                  <div className="flex items-center">
                    <i className="ri-star-fill text-yellow-500 text-sm"></i>
                    <span className="text-sm text-gray-400 ml-1">{(course.rating / 10).toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{course.description}</p>
                <div className="mt-2">
                  <div className="relative pt-1">
                    <div className={`overflow-hidden h-1 text-xs flex rounded bg-zinc-800`}>
                      <div 
                        style={{ width: `${course.progress}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColorClass(course.color)}`}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-400">
                    <i className="ri-time-line mr-1"></i>
                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    course.isCompleted ? 'bg-green-500/20 text-green-500' :
                    course.isStarted ? 'bg-primary/20 text-primary' :
                    'bg-zinc-800 text-gray-400'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

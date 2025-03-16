import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuth } from "@/hooks/use-auth";
import { UserCourseProgress, Course } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LearningProgress() {
  const { user } = useAuth();
  
  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  const { data: courseProgresses, isLoading: isProgressLoading } = useQuery<UserCourseProgress[]>({
    queryKey: ["/api/user/course-progress"],
    enabled: !!user,
  });
  
  const isLoading = isCoursesLoading || isProgressLoading;
  
  // Current active course with the highest progress
  const currentCourse = useMemo(() => {
    if (!courses || !courseProgresses) return null;
    
    // Find course progress that's started but not completed, with the highest completion
    const inProgressCourses = courseProgresses
      .filter(progress => progress.isStarted && !progress.isCompleted)
      .sort((a, b) => (b.completedLessons / (courses.find(c => c.id === b.courseId)?.totalLessons || 1)) - 
                      (a.completedLessons / (courses.find(c => c.id === a.courseId)?.totalLessons || 1)));
    
    if (inProgressCourses.length === 0) return null;
    
    const currentProgress = inProgressCourses[0];
    const courseDetails = courses.find(c => c.id === currentProgress.courseId);
    
    if (!courseDetails) return null;
    
    return {
      ...courseDetails,
      completedLessons: currentProgress.completedLessons,
      progress: Math.round((currentProgress.completedLessons / courseDetails.totalLessons) * 100)
    };
  }, [courses, courseProgresses]);
  
  // Stats about all courses
  const courseStats = useMemo(() => {
    if (!courses || !courseProgresses) {
      return { total: 0, completed: 0, inProgress: 0 };
    }
    
    const completed = courseProgresses.filter(p => p.isCompleted).length;
    const inProgress = courseProgresses.filter(p => p.isStarted && !p.isCompleted).length;
    
    return {
      total: courses.length,
      completed,
      inProgress
    };
  }, [courses, courseProgresses]);
  
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="mt-8 bg-zinc-900 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Your Learning Progress</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Course */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-[60px] h-[60px] rounded-full">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>
                <div className="ml-4 flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ) : currentCourse ? (
              <div className="flex items-center">
                <ProgressRing progress={currentCourse.progress} color="#6366F1" />
                <div className="ml-4">
                  <h4 className="font-medium text-white">{currentCourse.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentCourse.completedLessons} of {currentCourse.totalLessons} lessons completed
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-gray-400">No course in progress</p>
                <button className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                  Start a Course
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Total Courses */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            {isLoading ? (
              <>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-10 w-10 rounded" />
                </div>
                <Skeleton className="h-8 w-16 mt-2 mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">Total Courses</h4>
                    <p className="text-3xl font-bold mt-2">{courseStats.total}</p>
                  </div>
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <i className="ri-book-open-line text-green-500 text-2xl"></i>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400">Completed</p>
                    <p className="text-sm font-medium text-white">{courseStats.completed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">In Progress</p>
                    <p className="text-sm font-medium text-white">{courseStats.inProgress}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Streak */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            {isLoading ? (
              <>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-10 w-10 rounded" />
                </div>
                <Skeleton className="h-8 w-24 mt-2 mb-4" />
                <div className="flex justify-between">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Skeleton className="h-4 w-4 rounded-full mb-1" />
                      <Skeleton className="h-3 w-3" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">Current Streak</h4>
                    <p className="text-3xl font-bold mt-2">{user?.streak || 0} days</p>
                  </div>
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <i className="ri-fire-line text-amber-500 text-2xl"></i>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  {weekDays.map((day, index) => {
                    // For demo purposes: Streak is active up to the user's streak count
                    const isActive = index < (user?.streak || 0);
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full mb-1 ${isActive ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
                        <p className="text-xs text-gray-400">{day}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

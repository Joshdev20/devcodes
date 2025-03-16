import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SideNavigation } from "@/components/layout/side-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuth } from "@/hooks/use-auth";
import { Course, Lesson, UserCourseProgress, UserLessonProgress } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CoursePage() {
  const [_, params] = useRoute<{ id: string }>("/course/:id");
  const [__, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const courseId = params ? parseInt(params.id) : null;
  
  // Get course details and lessons
  const { data: courseData, isLoading: isLoadingCourse } = useQuery<{
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
    totalLessons: number;
    difficulty: string;
    rating: number;
    lessons: Lesson[];
  }>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Get user progress for this course
  const { data: courseProgress, isLoading: isLoadingProgress } = useQuery<UserCourseProgress>({
    queryKey: [`/api/user/course-progress?courseId=${courseId}`],
    enabled: !!courseId && !!user,
  });
  
  // Get user lesson progress
  const { data: lessonProgress, isLoading: isLoadingLessonProgress } = useQuery<UserLessonProgress[]>({
    queryKey: ["/api/user/lesson-progress"],
    enabled: !!courseId && !!user,
  });
  
  // Start course mutation
  const startCourseMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) return null;
      
      const data = {
        courseId,
        completedLessons: 0,
        isStarted: true,
        isCompleted: false
      };
      
      const res = await apiRequest("POST", "/api/user/course-progress", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/course-progress?courseId=${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/course-progress"] });
      toast({
        title: "Course started",
        description: "You've successfully started this course!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start course",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleStartCourse = () => {
    startCourseMutation.mutate();
  };
  
  const handleContinueCourse = () => {
    // Find the first incomplete lesson
    if (courseData?.lessons && lessonProgress) {
      const incompleteLessons = courseData.lessons
        .filter(lesson => !lessonProgress.some(p => p.lessonId === lesson.id && p.completed));
        
      if (incompleteLessons.length > 0) {
        navigate(`/lesson/${incompleteLessons[0].id}`);
      } else if (courseData.lessons.length > 0) {
        // If all lessons are complete, go to the first one
        navigate(`/lesson/${courseData.lessons[0].id}`);
      }
    }
  };
  
  const handleLessonClick = (lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  };
  
  // Calculate completion percentage
  const completionPercentage = courseProgress 
    ? Math.round((courseProgress.completedLessons / (courseData?.totalLessons || 1)) * 100)
    : 0;

  // Get appropriate color classes based on course color
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
      case 'yellow': return 'text-yellow-500';
      case 'blue': return 'text-blue-500';
      case 'cyan': return 'text-cyan-500';
      case 'green': return 'text-green-500';
      default: return 'text-primary';
    }
  };
  
  const getStrokeColor = (color: string) => {
    switch (color) {
      case 'yellow': return '#F59E0B';
      case 'blue': return '#3B82F6';
      case 'cyan': return '#06B6D4';
      case 'green': return '#10B981';
      default: return '#6366F1';
    }
  };
  
  const isLessonCompleted = (lessonId: number) => {
    return lessonProgress?.some(p => p.lessonId === lessonId && p.completed) || false;
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-gray-50">
      <SideNavigation />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopNavigation />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          {isLoadingCourse ? (
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-6" />
                
                <div className="flex mb-8">
                  <Skeleton className="h-32 w-32 rounded-lg mr-6" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                
                <Skeleton className="h-8 w-40 mb-6" />
                
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : courseData ? (
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
                    {courseData.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">{courseData.description}</p>
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
              
              {/* Course Info Card */}
              <div className="bg-zinc-900 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row">
                  <div className={`flex items-center justify-center w-24 h-24 rounded-lg bg-gradient-to-br ${getColorClass(courseData.color)} mr-6 mb-4 md:mb-0`}>
                    <i className={`${courseData.icon} text-4xl ${getIconColorClass(courseData.color)}`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center mb-2">
                      <span className="mr-3 text-sm text-gray-400">
                        <i className="ri-book-2-line mr-1"></i> {courseData.totalLessons} lessons
                      </span>
                      <span className="mr-3 text-sm text-gray-400">
                        <i className="ri-bar-chart-line mr-1"></i> {courseData.difficulty}
                      </span>
                      <span className="text-sm text-gray-400">
                        <i className="ri-star-fill text-yellow-500 mr-1"></i> {(courseData.rating / 10).toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      {courseProgress ? (
                        <div className="flex items-center">
                          <ProgressRing 
                            progress={completionPercentage} 
                            size={40} 
                            color={getStrokeColor(courseData.color)}
                            className="mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {courseProgress.completedLessons} of {courseData.totalLessons} lessons completed
                            </p>
                            <p className="text-xs text-gray-400">
                              {courseProgress.isCompleted 
                                ? "You've completed this course!" 
                                : "Keep going, you're making progress!"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">You haven't started this course yet.</p>
                      )}
                    </div>
                    
                    <div>
                      {courseProgress ? (
                        <Button onClick={handleContinueCourse} className="mr-2">
                          <i className="ri-play-circle-line mr-1"></i> Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleStartCourse} 
                          disabled={startCourseMutation.isPending}
                        >
                          {startCourseMutation.isPending ? (
                            <>
                              <i className="ri-loader-2-line animate-spin mr-1"></i> Starting...
                            </>
                          ) : (
                            <>
                              <i className="ri-play-circle-line mr-1"></i> Start Course
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lessons List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Course Content</h3>
                <div className="space-y-4">
                  {courseData.lessons?.map((lesson, index) => (
                    <Card 
                      key={lesson.id} 
                      className={`bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer ${isLessonCompleted(lesson.id) ? 'border-l-4 border-l-green-500' : ''}`}
                      onClick={() => handleLessonClick(lesson.id)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-zinc-700 mr-3">
                            {isLessonCompleted(lesson.id) ? (
                              <i className="ri-check-line text-green-500"></i>
                            ) : (
                              <span className="text-sm text-gray-400">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{lesson.title}</h4>
                            <p className="text-xs text-gray-400">
                              {isLessonCompleted(lesson.id) 
                                ? "Completed" 
                                : (courseProgress?.isStarted ? "Not completed" : "Locked")}
                            </p>
                          </div>
                        </div>
                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 sm:px-6 lg:px-8 text-center">
              <div className="py-12">
                <i className="ri-error-warning-line text-5xl text-gray-500 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">Course Not Found</h3>
                <p className="text-gray-400 mb-6">The course you are looking for doesn't exist or has been removed.</p>
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

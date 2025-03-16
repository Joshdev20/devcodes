import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SideNavigation } from "@/components/layout/side-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeEditor } from "@/components/code-editor/editor";
import { useAuth } from "@/hooks/use-auth";
import { Lesson, Course, UserLessonProgress } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LessonPage() {
  const [_, params] = useRoute<{ id: string }>("/lesson/:id");
  const [__, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const lessonId = params ? parseInt(params.id) : null;
  
  const [code, setCode] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Get lesson details
  const { data: lesson, isLoading: isLoadingLesson } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId,
  });
  
  // Get course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${lesson?.courseId}`],
    enabled: !!lesson?.courseId,
  });
  
  // Get all lessons for the course
  const { data: courseLessons, isLoading: isLoadingCourseLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${lesson?.courseId}/lessons`],
    enabled: !!lesson?.courseId,
  });
  
  // Get user lesson progress
  const { data: lessonProgress, isLoading: isLoadingLessonProgress } = useQuery<UserLessonProgress>({
    queryKey: [`/api/user/lesson-progress?lessonId=${lessonId}`],
    enabled: !!lessonId && !!user,
  });
  
  // Set up code when lesson data loads
  useEffect(() => {
    if (lesson && lesson.codeTemplate) {
      setCode(lesson.codeTemplate);
    }
  }, [lesson]);
  
  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId) return null;
      
      const data = {
        lessonId,
        completed: true
      };
      
      const res = await apiRequest("POST", "/api/user/lesson-progress", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/lesson-progress?lessonId=${lessonId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/course-progress"] });
      
      toast({
        title: "Lesson completed",
        description: "Great job! You've completed this lesson."
      });
      
      setIsCorrect(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete lesson",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Function to handle code run
  const handleRunCode = (code: string) => {
    setCode(code);
  };
  
  // Function to handle code submit
  const handleSubmitCode = (code: string) => {
    setCode(code);
    
    // In a real app, we'd validate the solution more thoroughly
    // For this demo, we'll just check if their code includes some key part of the solution
    if (lesson?.solution && code.includes(lesson.solution.trim())) {
      completeLessonMutation.mutate();
    } else {
      toast({
        title: "Not quite right",
        description: "Your solution doesn't seem to match what we're looking for. Try again!",
        variant: "destructive"
      });
    }
  };
  
  // Function to navigate to next lesson
  const handleNextLesson = () => {
    if (!courseLessons || !lesson) return;
    
    const currentIndex = courseLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex < courseLessons.length - 1) {
      navigate(`/lesson/${courseLessons[currentIndex + 1].id}`);
    } else {
      // If this was the last lesson, go back to the course page
      navigate(`/course/${lesson.courseId}`);
    }
  };
  
  // Function to navigate to previous lesson
  const handlePreviousLesson = () => {
    if (!courseLessons || !lesson) return;
    
    const currentIndex = courseLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex > 0) {
      navigate(`/lesson/${courseLessons[currentIndex - 1].id}`);
    }
  };
  
  // Get color classes based on course color
  const getColorClass = (color: string) => {
    switch (color) {
      case 'yellow': return 'text-yellow-500';
      case 'blue': return 'text-blue-500';
      case 'cyan': return 'text-cyan-500';
      case 'green': return 'text-green-500';
      default: return 'text-primary';
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-gray-50">
      <SideNavigation />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopNavigation />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {isLoadingLesson || isLoadingCourse || isLoadingLessonProgress ? (
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-9 w-24" />
                </div>
                
                <Skeleton className="h-64 w-full mb-6 rounded-lg" />
                
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
            </div>
          ) : lesson && course ? (
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {/* Lesson Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center mb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/course/${lesson.courseId}`)}
                      className="mr-2 -ml-2"
                    >
                      <i className="ri-arrow-left-line mr-1"></i> Back to Course
                    </Button>
                    <span className={`text-sm ${getColorClass(course.color)}`}>
                      {course.title}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {lesson.title}
                  </h2>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousLesson}
                    disabled={!courseLessons || courseLessons.findIndex(l => l.id === lesson.id) === 0}
                  >
                    <i className="ri-arrow-left-s-line mr-1"></i> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextLesson}
                    disabled={!courseLessons || courseLessons.findIndex(l => l.id === lesson.id) === courseLessons.length - 1}
                  >
                    Next <i className="ri-arrow-right-s-line ml-1"></i>
                  </Button>
                </div>
              </div>
              
              {/* Lesson Content */}
              <Card className="bg-zinc-900 border-zinc-800 mb-6">
                <CardContent className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </div>
                </CardContent>
              </Card>
              
              {/* Code Editor */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Code Exercise</h3>
                <div className="relative">
                  <CodeEditor
                    initialCode={lesson.codeTemplate || "// No code template available"}
                    solution={lesson.solution}
                    title={lesson.title}
                    language="javascript"
                    onRunCode={handleRunCode}
                    onSubmit={handleSubmitCode}
                    isCorrect={isCorrect || lessonProgress?.completed}
                    showFullEditor={true}
                  />
                  
                  {/* Completed overlay */}
                  {(isCorrect || lessonProgress?.completed) && (
                    <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center rounded-lg">
                      <div className="bg-green-500/20 p-3 rounded-full mb-4">
                        <i className="ri-check-line text-3xl text-green-500"></i>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Lesson Completed!
                      </h3>
                      <p className="text-gray-400 mb-6 text-center max-w-md">
                        Great job! You've successfully completed this lesson.
                        {courseLessons && courseLessons.findIndex(l => l.id === lesson.id) < courseLessons.length - 1 
                          ? " Continue to the next lesson to keep learning."
                          : " You've completed all lessons in this course!"}
                      </p>
                      {courseLessons && courseLessons.findIndex(l => l.id === lesson.id) < courseLessons.length - 1 ? (
                        <Button onClick={handleNextLesson}>
                          Continue to Next Lesson <i className="ri-arrow-right-line ml-1"></i>
                        </Button>
                      ) : (
                        <Button onClick={() => navigate(`/course/${lesson.courseId}`)}>
                          Back to Course Overview <i className="ri-arrow-right-line ml-1"></i>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lesson navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousLesson}
                  disabled={!courseLessons || courseLessons.findIndex(l => l.id === lesson.id) === 0}
                >
                  <i className="ri-arrow-left-line mr-1"></i> Previous Lesson
                </Button>
                
                {!isCorrect && !lessonProgress?.completed ? (
                  <Button
                    onClick={() => handleSubmitCode(code)}
                    disabled={completeLessonMutation.isPending}
                  >
                    {completeLessonMutation.isPending ? (
                      <>
                        <i className="ri-loader-2-line animate-spin mr-1"></i> Submitting...
                      </>
                    ) : (
                      <>
                        Complete & Continue <i className="ri-check-line ml-1"></i>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextLesson}
                    disabled={!courseLessons || courseLessons.findIndex(l => l.id === lesson.id) === courseLessons.length - 1}
                  >
                    Next Lesson <i className="ri-arrow-right-line ml-1"></i>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 sm:px-6 lg:px-8 text-center">
              <div className="py-12">
                <i className="ri-error-warning-line text-5xl text-gray-500 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">Lesson Not Found</h3>
                <p className="text-gray-400 mb-6">The lesson you are looking for doesn't exist or has been removed.</p>
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

import { useAuth } from "@/hooks/use-auth";
import { SideNavigation } from "@/components/layout/side-navigation";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { LearningProgress } from "@/components/dashboard/learning-progress";
import { LearningPaths } from "@/components/dashboard/learning-paths";
import { CourseList } from "@/components/dashboard/course-list";
import { CodeEditor } from "@/components/code-editor/editor";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserCourseProgress, Course, Lesson } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  const { data: courseProgresses } = useQuery<UserCourseProgress[]>({
    queryKey: ["/api/user/course-progress"],
    enabled: !!user,
  });
  
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Find the latest course the user was working on
  const latestCourseProgress = courseProgresses
    ?.filter(progress => progress.isStarted && !progress.isCompleted)
    ?.sort((a, b) => new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime())[0];
  
  const latestCourse = courses?.find(course => course.id === latestCourseProgress?.courseId);
  
  // Load the first lesson of the latest course
  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${latestCourseProgress?.courseId}/lessons`],
    enabled: !!latestCourseProgress,
  });
  
  const currentLesson = lessons?.[0];
  
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-gray-50">
      <SideNavigation />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopNavigation />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
                  Welcome back, {user?.displayName || 'User'}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {latestCourseProgress && courses 
                    ? `You've completed ${latestCourseProgress.completedLessons} of ${latestCourse?.totalLessons || 0} lessons in ${latestCourse?.title}. Keep it up!`
                    : "Start your coding journey by exploring a learning path or course."}
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button 
                  variant="outline"
                  className="inline-flex items-center"
                  onClick={() => navigate("/daily-goals")}
                >
                  <i className="ri-calendar-line mr-2"></i>
                  Daily Goals
                </Button>
                <Button
                  className="ml-3 inline-flex items-center"
                  onClick={() => latestCourseProgress 
                    ? navigate(`/course/${latestCourseProgress.courseId}`) 
                    : navigate("/courses")
                  }
                >
                  <i className="ri-play-circle-line mr-2"></i>
                  {latestCourseProgress ? 'Continue Learning' : 'Start Learning'}
                </Button>
              </div>
            </div>

            {/* Learning Progress */}
            <LearningProgress />

            {/* Learning Paths */}
            <LearningPaths />

            {/* Featured Courses */}
            <CourseList />

            {/* Code Editor Preview */}
            <div className="mt-8 bg-zinc-900 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Continue Your Lesson</h3>
                <Button
                  variant="link"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  onClick={() => currentLesson 
                    ? navigate(`/lesson/${currentLesson.id}`) 
                    : navigate("/courses")
                  }
                >
                  Open Full Editor <i className="ri-external-link-line ml-1"></i>
                </Button>
              </div>
              
              {currentLesson ? (
                <CodeEditor 
                  initialCode={currentLesson.codeTemplate || "// No code template available"}
                  title={currentLesson.title}
                  language="javascript"
                />
              ) : (
                <div className="bg-zinc-800 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <i className="ri-code-line text-4xl"></i>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">No Active Lesson</h4>
                  <p className="text-gray-400 mb-4">Start a course to begin coding and tracking your progress.</p>
                  <Button onClick={() => navigate("/courses")}>
                    Browse Courses
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

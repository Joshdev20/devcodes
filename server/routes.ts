import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserPathProgressSchema, insertUserCourseProgressSchema, insertUserLessonProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes
  setupAuth(app);

  // API routes
  // Get learning paths
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await storage.getLearningPaths();
      res.json(paths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });
  
  // Get specific learning path
  app.get("/api/learning-paths/:id", async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      const path = await storage.getLearningPath(pathId);
      
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      res.json(path);
    } catch (error) {
      console.error("Error fetching learning path:", error);
      res.status(500).json({ message: "Failed to fetch learning path" });
    }
  });
  
  // Get courses for a specific learning path
  app.get("/api/learning-paths/:id/courses", async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      const pathCourses = await storage.getPathCourses(pathId);
      
      if (!pathCourses || pathCourses.length === 0) {
        return res.json([]);
      }
      
      res.json(pathCourses);
    } catch (error) {
      console.error("Error fetching path courses:", error);
      res.status(500).json({ message: "Failed to fetch path courses" });
    }
  });

  // Get user path progress
  app.get("/api/user/path-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const pathProgresses = await storage.getUserPathProgresses(userId);
      res.json(pathProgresses);
    } catch (error) {
      console.error("Error fetching user path progress:", error);
      res.status(500).json({ message: "Failed to fetch user path progress" });
    }
  });

  // Start or update a learning path
  app.post("/api/user/path-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const data = insertUserPathProgressSchema.parse({
        ...req.body,
        userId
      });

      const existingProgress = await storage.getUserPathProgress(userId, data.pathId);

      if (existingProgress) {
        const updatedProgress = await storage.updateUserPathProgress(userId, data.pathId, {
          progress: data.progress,
          isActive: data.isActive,
          isCompleted: data.isCompleted
        });
        return res.json(updatedProgress);
      }

      const newProgress = await storage.createUserPathProgress(data);
      res.status(201).json(newProgress);
    } catch (error) {
      console.error("Error updating path progress:", error);
      res.status(500).json({ message: "Failed to update path progress" });
    }
  });

  // Get courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get a specific course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const lessons = await storage.getLessons(courseId);
      res.json({ ...course, lessons });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get user course progress
  app.get("/api/user/course-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const courseProgresses = await storage.getUserCourseProgresses(userId);
      res.json(courseProgresses);
    } catch (error) {
      console.error("Error fetching user course progress:", error);
      res.status(500).json({ message: "Failed to fetch user course progress" });
    }
  });

  // Start or update a course progress
  app.post("/api/user/course-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const data = insertUserCourseProgressSchema.parse({
        ...req.body,
        userId,
        lastAccessed: new Date()
      });

      const existingProgress = await storage.getUserCourseProgress(userId, data.courseId);

      if (existingProgress) {
        const updatedProgress = await storage.updateUserCourseProgress(userId, data.courseId, {
          completedLessons: data.completedLessons,
          isStarted: data.isStarted,
          isCompleted: data.isCompleted
        });
        return res.json(updatedProgress);
      }

      const newProgress = await storage.createUserCourseProgress(data);
      res.status(201).json(newProgress);
    } catch (error) {
      console.error("Error updating course progress:", error);
      res.status(500).json({ message: "Failed to update course progress" });
    }
  });

  // Get lessons for a course
  app.get("/api/courses/:id/lessons", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessons(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Get a specific lesson
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Get user lesson progress
  app.get("/api/user/lesson-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const lessonProgresses = await storage.getUserLessonProgresses(userId);
      res.json(lessonProgresses);
    } catch (error) {
      console.error("Error fetching user lesson progress:", error);
      res.status(500).json({ message: "Failed to fetch user lesson progress" });
    }
  });

  // Complete a lesson
  app.post("/api/user/lesson-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const data = insertUserLessonProgressSchema.parse({
        ...req.body,
        userId
      });

      const existingProgress = await storage.getUserLessonProgress(userId, data.lessonId);

      if (existingProgress) {
        const updatedProgress = await storage.updateUserLessonProgress(
          userId, 
          data.lessonId, 
          data.completed ?? false
        );
        return res.json(updatedProgress);
      }

      const newProgress = await storage.createUserLessonProgress(data);
      
      // If marking a lesson as complete, update the course progress as well
      if (data.completed) {
        // Get the lesson to find its course
        const lesson = await storage.getLesson(data.lessonId);
        if (lesson) {
          const courseProgress = await storage.getUserCourseProgress(userId, lesson.courseId);
          const course = await storage.getCourse(lesson.courseId);
          
          if (course) {
            if (courseProgress) {
              // Increment completed lessons count
              const completedLessons = courseProgress.completedLessons + 1;
              // Check if course is now completed
              const isCompleted = completedLessons >= course.totalLessons;
              
              await storage.updateUserCourseProgress(userId, lesson.courseId, {
                completedLessons,
                isStarted: true,
                isCompleted
              });
              
              // If this completes a course, check if any path progress needs updating
              if (isCompleted) {
                const pathCourses = Array.from((await storage.getPathCourses(0)).values())
                  .filter(pc => pc.courseId === lesson.courseId);
                
                for (const pc of pathCourses) {
                  const pathProgress = await storage.getUserPathProgress(userId, pc.pathId);
                  if (pathProgress) {
                    // For simplicity, we're using a percentage calculation
                    // A more accurate implementation would track all courses in the path
                    const progress = Math.min(100, pathProgress.progress + Math.floor(100 / pathCourses.length));
                    await storage.updateUserPathProgress(userId, pc.pathId, {
                      progress,
                      isCompleted: progress >= 100
                    });
                  }
                }
              }
            } else {
              // Create new course progress if it doesn't exist
              await storage.createUserCourseProgress({
                userId,
                courseId: lesson.courseId,
                completedLessons: 1,
                isStarted: true,
                isCompleted: 1 >= course.totalLessons,
                lastAccessed: new Date()
              });
            }
          }
        }
      }
      
      res.status(201).json(newProgress);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      res.status(500).json({ message: "Failed to update lesson progress" });
    }
  });

  // Get user streak data
  app.get("/api/user/streak", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const streaks = await storage.getDailyStreaks(userId);
      res.json(streaks);
    } catch (error) {
      console.error("Error fetching user streaks:", error);
      res.status(500).json({ message: "Failed to fetch user streaks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

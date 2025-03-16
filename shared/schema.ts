import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  streak: integer("streak").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

// Courses schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  totalLessons: integer("total_lessons").notNull(),
  difficulty: text("difficulty").notNull(),
  rating: integer("rating").default(0),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

// Lessons schema
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  codeTemplate: text("code_template"),
  solution: text("solution"),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

// Learning paths schema
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  durationWeeks: integer("duration_weeks").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
});

// Learning path courses (join table)
export const pathCourses = pgTable("path_courses", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull(),
  courseId: integer("course_id").notNull(),
  order: integer("order").notNull(),
});

export const insertPathCourseSchema = createInsertSchema(pathCourses).omit({
  id: true,
});

// User progress on courses
export const userCourseProgress = pgTable("user_course_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  completedLessons: integer("completed_lessons").default(0).notNull(),
  isStarted: boolean("is_started").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  lastAccessed: timestamp("last_accessed"),
});

export const insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).omit({
  id: true,
});

// User progress on learning paths
export const userPathProgress = pgTable("user_path_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pathId: integer("path_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

export const insertUserPathProgressSchema = createInsertSchema(userPathProgress).omit({
  id: true,
});

// User progress on lessons
export const userLessonProgress = pgTable("user_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
  id: true,
});

// Daily streak records
export const dailyStreaks = pgTable("daily_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
});

export const insertDailyStreakSchema = createInsertSchema(dailyStreaks).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export type PathCourse = typeof pathCourses.$inferSelect;
export type InsertPathCourse = z.infer<typeof insertPathCourseSchema>;

export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type InsertUserCourseProgress = z.infer<typeof insertUserCourseProgressSchema>;

export type UserPathProgress = typeof userPathProgress.$inferSelect;
export type InsertUserPathProgress = z.infer<typeof insertUserPathProgressSchema>;

export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;

export type DailyStreak = typeof dailyStreaks.$inferSelect;
export type InsertDailyStreak = z.infer<typeof insertDailyStreakSchema>;

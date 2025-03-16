import { 
  users, courses, lessons, learningPaths, pathCourses,
  userCourseProgress, userPathProgress, userLessonProgress, dailyStreaks,
  type User, type InsertUser, type Course, type InsertCourse,
  type Lesson, type InsertLesson, type LearningPath, type InsertLearningPath,
  type PathCourse, type InsertPathCourse, type UserCourseProgress,
  type InsertUserCourseProgress, type UserPathProgress, type InsertUserPathProgress,
  type UserLessonProgress, type InsertUserLessonProgress, type DailyStreak, type InsertDailyStreak
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(userId: number, streak: number): Promise<User>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Lesson operations
  getLessons(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Learning path operations
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  
  // Path course operations
  getPathCourses(pathId: number): Promise<PathCourse[]>;
  createPathCourse(pathCourse: InsertPathCourse): Promise<PathCourse>;
  
  // User course progress operations
  getUserCourseProgresses(userId: number): Promise<UserCourseProgress[]>;
  getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined>;
  createUserCourseProgress(progress: InsertUserCourseProgress): Promise<UserCourseProgress>;
  updateUserCourseProgress(userId: number, courseId: number, data: Partial<UserCourseProgress>): Promise<UserCourseProgress>;
  
  // User path progress operations
  getUserPathProgresses(userId: number): Promise<UserPathProgress[]>;
  getUserPathProgress(userId: number, pathId: number): Promise<UserPathProgress | undefined>;
  createUserPathProgress(progress: InsertUserPathProgress): Promise<UserPathProgress>;
  updateUserPathProgress(userId: number, pathId: number, data: Partial<UserPathProgress>): Promise<UserPathProgress>;
  
  // User lesson progress operations
  getUserLessonProgresses(userId: number): Promise<UserLessonProgress[]>;
  getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined>;
  createUserLessonProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress>;
  updateUserLessonProgress(userId: number, lessonId: number, completed: boolean): Promise<UserLessonProgress>;
  
  // Streak operations
  getDailyStreaks(userId: number): Promise<DailyStreak[]>;
  createDailyStreak(streak: InsertDailyStreak): Promise<DailyStreak>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private lessons: Map<number, Lesson>;
  private learningPaths: Map<number, LearningPath>;
  private pathCourses: Map<number, PathCourse>;
  private userCourseProgresses: Map<string, UserCourseProgress>;
  private userPathProgresses: Map<string, UserPathProgress>;
  private userLessonProgresses: Map<string, UserLessonProgress>;
  private dailyStreaks: Map<number, DailyStreak>;
  
  sessionStore: session.Store;
  
  // Counters for ID generation
  private userIdCounter = 1;
  private courseIdCounter = 1;
  private lessonIdCounter = 1;
  private pathIdCounter = 1;
  private pathCourseIdCounter = 1;
  private userCourseProgressIdCounter = 1;
  private userPathProgressIdCounter = 1;
  private userLessonProgressIdCounter = 1;
  private dailyStreakIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.learningPaths = new Map();
    this.pathCourses = new Map();
    this.userCourseProgresses = new Map();
    this.userPathProgresses = new Map();
    this.userLessonProgresses = new Map();
    this.dailyStreaks = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, streak: 0 };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserStreak(userId: number, streak: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, streak };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const newCourse: Course = { 
      ...course, 
      id,
      rating: course.rating ?? null
    };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  // Lesson operations
  async getLessons(courseId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonIdCounter++;
    const newLesson: Lesson = { 
      ...lesson, 
      id,
      codeTemplate: lesson.codeTemplate ?? null,
      solution: lesson.solution ?? null
    };
    this.lessons.set(id, newLesson);
    return newLesson;
  }

  // Learning path operations
  async getLearningPaths(): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values());
  }

  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    return this.learningPaths.get(id);
  }

  async createLearningPath(path: InsertLearningPath): Promise<LearningPath> {
    const id = this.pathIdCounter++;
    const newPath: LearningPath = { ...path, id };
    this.learningPaths.set(id, newPath);
    return newPath;
  }

  // Path course operations
  async getPathCourses(pathId: number): Promise<PathCourse[]> {
    return Array.from(this.pathCourses.values())
      .filter(pc => pc.pathId === pathId)
      .sort((a, b) => a.order - b.order);
  }

  async createPathCourse(pathCourse: InsertPathCourse): Promise<PathCourse> {
    const id = this.pathCourseIdCounter++;
    const newPathCourse: PathCourse = { ...pathCourse, id };
    this.pathCourses.set(id, newPathCourse);
    return newPathCourse;
  }

  // User course progress operations
  async getUserCourseProgresses(userId: number): Promise<UserCourseProgress[]> {
    return Array.from(this.userCourseProgresses.values())
      .filter(progress => progress.userId === userId);
  }

  async getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    return this.userCourseProgresses.get(`${userId}-${courseId}`);
  }

  async createUserCourseProgress(progress: InsertUserCourseProgress): Promise<UserCourseProgress> {
    const id = this.userCourseProgressIdCounter++;
    const newProgress: UserCourseProgress = { 
      ...progress, 
      id,
      lastAccessed: progress.lastAccessed || new Date()
    };
    this.userCourseProgresses.set(`${progress.userId}-${progress.courseId}`, newProgress);
    return newProgress;
  }

  async updateUserCourseProgress(userId: number, courseId: number, data: Partial<UserCourseProgress>): Promise<UserCourseProgress> {
    const key = `${userId}-${courseId}`;
    const existingProgress = this.userCourseProgresses.get(key);
    
    if (!existingProgress) {
      throw new Error(`Progress record for user ${userId} and course ${courseId} not found`);
    }
    
    const updatedProgress = { ...existingProgress, ...data, lastAccessed: new Date() };
    this.userCourseProgresses.set(key, updatedProgress);
    return updatedProgress;
  }

  // User path progress operations
  async getUserPathProgresses(userId: number): Promise<UserPathProgress[]> {
    return Array.from(this.userPathProgresses.values())
      .filter(progress => progress.userId === userId);
  }

  async getUserPathProgress(userId: number, pathId: number): Promise<UserPathProgress | undefined> {
    return this.userPathProgresses.get(`${userId}-${pathId}`);
  }

  async createUserPathProgress(progress: InsertUserPathProgress): Promise<UserPathProgress> {
    const id = this.userPathProgressIdCounter++;
    const newProgress: UserPathProgress = { ...progress, id };
    this.userPathProgresses.set(`${progress.userId}-${progress.pathId}`, newProgress);
    return newProgress;
  }

  async updateUserPathProgress(userId: number, pathId: number, data: Partial<UserPathProgress>): Promise<UserPathProgress> {
    const key = `${userId}-${pathId}`;
    const existingProgress = this.userPathProgresses.get(key);
    
    if (!existingProgress) {
      throw new Error(`Path progress record for user ${userId} and path ${pathId} not found`);
    }
    
    const updatedProgress = { ...existingProgress, ...data };
    this.userPathProgresses.set(key, updatedProgress);
    return updatedProgress;
  }

  // User lesson progress operations
  async getUserLessonProgresses(userId: number): Promise<UserLessonProgress[]> {
    return Array.from(this.userLessonProgresses.values())
      .filter(progress => progress.userId === userId);
  }

  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined> {
    return this.userLessonProgresses.get(`${userId}-${lessonId}`);
  }

  async createUserLessonProgress(progress: InsertUserLessonProgress): Promise<UserLessonProgress> {
    const id = this.userLessonProgressIdCounter++;
    const newProgress: UserLessonProgress = { 
      ...progress, 
      id, 
      completedAt: progress.completed ? new Date() : null 
    };
    this.userLessonProgresses.set(`${progress.userId}-${progress.lessonId}`, newProgress);
    return newProgress;
  }

  async updateUserLessonProgress(userId: number, lessonId: number, completed: boolean): Promise<UserLessonProgress> {
    const key = `${userId}-${lessonId}`;
    const existingProgress = this.userLessonProgresses.get(key);
    
    if (!existingProgress) {
      throw new Error(`Lesson progress record for user ${userId} and lesson ${lessonId} not found`);
    }
    
    const updatedProgress = { 
      ...existingProgress, 
      completed,
      completedAt: completed ? new Date() : null
    };
    this.userLessonProgresses.set(key, updatedProgress);
    return updatedProgress;
  }

  // Streak operations
  async getDailyStreaks(userId: number): Promise<DailyStreak[]> {
    return Array.from(this.dailyStreaks.values())
      .filter(streak => streak.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createDailyStreak(streak: InsertDailyStreak): Promise<DailyStreak> {
    const id = this.dailyStreakIdCounter++;
    const newStreak: DailyStreak = { ...streak, id };
    this.dailyStreaks.set(id, newStreak);
    return newStreak;
  }
  
  // Initialize sample data for development
  private initializeData() {
    // Sample courses
    const courses = [
      {
        title: "JavaScript Basics",
        description: "Learn the fundamentals of JavaScript",
        icon: "ri-javascript-line",
        color: "yellow",
        totalLessons: 28,
        difficulty: "beginner",
        rating: 48
      },
      {
        title: "HTML & CSS",
        description: "Build the foundation of web development",
        icon: "ri-html5-line",
        color: "blue",
        totalLessons: 32,
        difficulty: "beginner",
        rating: 49
      },
      {
        title: "React Fundamentals",
        description: "Build modern web applications with React",
        icon: "ri-reactjs-line",
        color: "cyan",
        totalLessons: 24,
        difficulty: "intermediate",
        rating: 47
      },
      {
        title: "Python Basics",
        description: "Start your journey with Python programming",
        icon: "ri-python-line",
        color: "green",
        totalLessons: 28,
        difficulty: "beginner",
        rating: 49
      }
    ];
    
    courses.forEach(course => {
      const id = this.courseIdCounter++;
      this.courses.set(id, { ...course, id });
    });
    
    // Sample learning paths
    const paths = [
      {
        title: "Frontend Developer",
        description: "Learn HTML, CSS, JavaScript and modern frontend frameworks",
        icon: "ri-layout-4-line",
        color: "primary",
        durationWeeks: 12,
        difficulty: "beginner-intermediate"
      },
      {
        title: "Backend Developer",
        description: "Learn Node.js, Express, databases and API development",
        icon: "ri-server-line",
        color: "secondary",
        durationWeeks: 10,
        difficulty: "intermediate"
      },
      {
        title: "Full Stack Developer",
        description: "Master both frontend and backend technologies",
        icon: "ri-stack-line",
        color: "accent",
        durationWeeks: 24,
        difficulty: "advanced"
      }
    ];
    
    paths.forEach(path => {
      const id = this.pathIdCounter++;
      this.learningPaths.set(id, { ...path, id });
    });
    
    // Sample lessons for JavaScript Basics
    const jsLessons = [
      {
        courseId: 1,
        title: "Introduction to JavaScript",
        content: "Learn about what JavaScript is and its role in web development.",
        order: 1,
        codeTemplate: "// Welcome to JavaScript!\nconsole.log('Hello, World!');",
        solution: "console.log('Hello, World!');"
      },
      {
        courseId: 1,
        title: "Variables and Data Types",
        content: "Learn about variables, constants, and the different data types in JavaScript.",
        order: 2,
        codeTemplate: "// Define a variable and assign a value\nlet userName = '';",
        solution: "let userName = 'Alex';"
      }
    ];
    
    jsLessons.forEach(lesson => {
      const id = this.lessonIdCounter++;
      this.lessons.set(id, { ...lesson, id });
    });
    
    // Connect courses to paths
    // Frontend path
    [
      { pathId: 1, courseId: 2, order: 1 }, // HTML & CSS
      { pathId: 1, courseId: 1, order: 2 }, // JavaScript Basics
      { pathId: 1, courseId: 3, order: 3 }  // React Fundamentals
    ].forEach(pc => {
      const id = this.pathCourseIdCounter++;
      this.pathCourses.set(id, { ...pc, id });
    });
    
    // Backend path
    [
      { pathId: 2, courseId: 4, order: 1 }, // Python Basics
      { pathId: 2, courseId: 1, order: 2 }  // JavaScript Basics (for Node.js)
    ].forEach(pc => {
      const id = this.pathCourseIdCounter++;
      this.pathCourses.set(id, { ...pc, id });
    });
    
    // Full Stack path
    [
      { pathId: 3, courseId: 2, order: 1 }, // HTML & CSS
      { pathId: 3, courseId: 1, order: 2 }, // JavaScript Basics
      { pathId: 3, courseId: 3, order: 3 }, // React Fundamentals
      { pathId: 3, courseId: 4, order: 4 }  // Python Basics
    ].forEach(pc => {
      const id = this.pathCourseIdCounter++;
      this.pathCourses.set(id, { ...pc, id });
    });
  }
}

export const storage = new MemStorage();

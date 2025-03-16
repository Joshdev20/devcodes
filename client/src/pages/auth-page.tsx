import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Create login form - only initialize when isLogin is true
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });
  
  // Create register form - only initialize when isLogin is false
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  
  // Reset the forms when switching between login and register
  useEffect(() => {
    if (isLogin) {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  }, [isLogin]);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Handle form submissions
  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }
  
  function onRegisterSubmit(data: RegisterFormValues) {
    const { confirmPassword, ...submitData } = data;
    registerMutation.mutate(submitData);
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-5">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-lg">
                <i className="ri-code-line text-2xl text-white"></i>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {isLogin 
                ? "Sign in to continue your learning journey" 
                : "Start your coding journey with CodePath"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLogin ? (
              // Login Form
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <i className="ri-loader-2-line animate-spin mr-2"></i>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-primary"
                      type="button"
                      onClick={() => setIsLogin(false)}
                    >
                      Don't have an account? Sign up
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              // Registration Form
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your password"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <i className="ri-loader-2-line animate-spin mr-2"></i>
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-primary"
                      type="button"
                      onClick={() => setIsLogin(true)}
                    >
                      Already have an account? Sign in
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Hero section */}
      <div className="flex-1 bg-zinc-900 hidden md:flex flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">Learn to code like a pro</h1>
          <p className="text-xl text-gray-300 mb-8">Master programming skills through interactive coding challenges, guided projects, and real-world applications.</p>
          
          <div className="space-y-4 max-w-md">
            <div className="flex items-start">
              <div className="mt-1 mr-4 p-1 rounded-full bg-primary/20 text-primary">
                <i className="ri-checkbox-circle-line text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold text-white">Interactive Code Exercises</h3>
                <p className="text-gray-400">Practice with real-time feedback and guidance</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 p-1 rounded-full bg-primary/20 text-primary">
                <i className="ri-checkbox-circle-line text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold text-white">Structured Learning Paths</h3>
                <p className="text-gray-400">Follow guided courses for frontend, backend, or full-stack</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 p-1 rounded-full bg-primary/20 text-primary">
                <i className="ri-checkbox-circle-line text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold text-white">Progress Tracking</h3>
                <p className="text-gray-400">Monitor your learning journey and build coding habits</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 inline-flex items-center text-gray-300">
            <i className="ri-user-star-line mr-2 text-primary"></i>
            Join thousands of developers already learning on CodePath
          </div>
        </div>
      </div>
    </div>
  );
}

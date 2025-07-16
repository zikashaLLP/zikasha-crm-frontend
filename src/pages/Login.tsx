import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Bookmark, Clock, FilePlus, List, } from "lucide-react";
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

import api from "@/api/axios";
import { AuthContext } from "@/contexts/AuthContext";

import { toast } from "sonner";

import ZikashaCRMLogo from "../assets/zikasha-crm-logo.svg";

// Zod schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// TypeScript types
type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    [key: string]: any;
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface AuthContextType {
  setUser: (user: LoginResponse['user']) => void;
  setToken: (token: string) => void;
}

export default function Login() {
  const { setUser, setToken } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();

  // Create the form with zodResolver
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("zikasha_crm_token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  // Submit handler
  async function onSubmit(values: LoginFormData): Promise<void> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", values);
      const { accessToken, refreshToken, user } = response.data;
      setToken(accessToken);
      setUser(user);
      localStorage.setItem("zikasha_crm_refresh_token", refreshToken);
      toast.success("login successful");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <>
      <div className="flex">
        <div className="flex min-h-screen items-center bg-white justify-center w-full md:w-1/2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-md w-full space-y-6 rounded p-6"
              noValidate
            >
              <div className="text-2xl font-bold text-muted-foreground"><img className="h-[36px]" src={ ZikashaCRMLogo } alt="Zikasha" /> Real Estate CRM</div>
              <h2 className="text-xl font-semibold">Login</h2>

              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      Password 
                      {/* <Link to="/register" className="text-sm font-normal text-primary hover:underline">
                        Lost your password?
                      </Link> */}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link target="_blank" to="https://zikasha.com/contact-us/" className="text-sm text-primary hover:underline">
                  Contact our team
                </Link>
              </p>

              <p className="text-xs text-muted-foreground m-0 mt-4">
                © 2025 Zikasha consultancy LLP. All rights reserved.
              </p>
              {/* <p className="text-xs mt-2">
                <Link className="text-primary hover:underline mr-3" to="/terms-of-service">
                  Terms of Service
                </Link>
                <Link className="text-primary hover:underline" to="/privacy-policy">
                  Privacy Policy
                </Link>
              </p> */}
            </form>
          </Form>
        </div>

        {/* Features */}
        <div className="md:w-1/2 hidden md:block bg-[url('./assets/login-banner.jpg')] bg-cover bg-center">
            
            <div className="max-h-screen h-full flex flex-col px-6 items-center justify-center">

              <div className="flex gap-5 bg-white rounded-lg shadow mb-6 max-w-[600px] w-full p-6 ">
                <div className="">
                  <FilePlus className="w-8 h-8 text-[#2b7fff] pt-1" />
                </div>
                <div className="w-full">
                  <h1 className="text-lg font-semibold">Manage Customer Inquiries</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Easily create and manage customer inquiries. Add conversation logs to keep a detailed record of all interactions.</p>
                </div>
              </div>

              <div className="flex gap-5 bg-white rounded-lg shadow mb-6 max-w-[600px] w-full p-6 ">
                <div className="">
                  <Bookmark className="w-8 h-8 text-[#2b7fff] pt-1" />
                </div>
                <div className="w-full">
                  <h1 className="text-lg font-semibold">Categorize Inquiries</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Organize inquiries into categories for faster access and more efficient tracking.</p>
                </div>
              </div>

              <div className="flex gap-5 bg-white rounded-lg shadow mb-6 max-w-[600px] w-full p-6 ">
                <div className="">
                  <List className="w-8 h-8 text-[#2b7fff] pt-1" />
                </div>
                <div className="w-full">
                  <h1 className="text-lg font-semibold">Add Custom Categories</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Create your own custom categories to organize inquiries in a way that best suits your workflow and preferences.</p>
                </div>
              </div>

              
              <div className="flex gap-5 bg-white rounded-lg shadow mb-6 max-w-[600px] w-full p-6 ">
                <div className="">
                  <Clock className="w-8 h-8 text-[#2b7fff] pt-1" />
                </div>
                <div className="w-full">
                  <h1 className="text-lg font-semibold">Receive Timely Reminders</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Stay on top of your follow-ups with automated reminders that help you engage with customers at the right time.</p>
                </div>
              </div>

            </div>
        </div>
      </div>
    </>
  );
}
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

// Zod schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // Create the form with zodResolver
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Submit handler
  async function onSubmit(values) {
    try {
      const response = await api.post("/auth/login", values);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      toast.success("login successful");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <>
      <div className="flex">
        <div className="flex min-h-screen items-center justify-center bg-gray-50 w-full md:w-1/2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-md w-full space-y-6 rounded p-6"
              noValidate
            >
              <div className="text-2xl font-bold text-primary">Zikasha CRM</div>
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
                    <FormLabel className="flex justify-between">Password <Link to="/register" className="text-sm font-normal text-primary hover:underline">Lost your password?</Link></FormLabel>
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
                <Link to="/register" className="text-sm text-primary hover:underline">
                  Register here
                </Link>
              </p>

              <p className="text-xs text-muted-foreground m-0 mt-4">
                © 2025 Zikasha consultancy LLP. All rights reserved.
              </p>
              <p className="text-xs mt-2">
                <Link className="text-primary hover:underline mr-3" to="/terms-of-service">Terms of Service</Link>
                <Link className="text-primary hover:underline" to="/privacy-policy">Privacy Policy</Link>
              </p>
            </form>
          </Form>
        </div>
        <div className="md:w-1/2 hidden md:block bg-[url('./assets/login-banner.jpg')] bg-cover bg-center"></div>
      </div>
    </>
  );
}

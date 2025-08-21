import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/api/axios";
import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthContext } from "@/contexts/AuthContext";

type InquryDefault = {
  location: string;
  followup_date: string;
  category: number;
};

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Improved schema for optional email and phone.
const inquiryDefaultSchema = z.object({
  location: z.string().optional(),
  followup_date: z.string().optional(),
  category: z.number().optional(),
});

type InquiryDefaultFormValues = z.infer<typeof inquiryDefaultSchema>;

export default function AddCustomerModal() {
  const [settings, setSettings] = useState<InquryDefault | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const { user } = useContext(AuthContext);

  const form = useForm<InquiryDefaultFormValues>({
    resolver: zodResolver(inquiryDefaultSchema),
    defaultValues: {
      location: "",
      followup_date: "",
      category: 0,
    },
  });
  

  useEffect(() => {
    // Fetch categories
    async function fetchData() {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          api.get(`/agencies/${user.agency.id}/settings`),
          api.get<ApiResponse<Category[]>>("/categories"),
        ]);
        setSettings(settingsRes.data.settings);
        setCategories(categoriesRes.data.data || categoriesRes.data);
      } catch (error) {
        toast.error("Failed to fetch categories or settings");
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        location: settings?.location || "",
        followup_date: settings?.followup_date || "",
        category: settings?.category || 0,
      });
    }
  }, [settings, form]);

  const handleSelectChange = (fieldName: keyof InquiryDefaultFormValues) => {
    return (value: string) => {
      // Convert string to number for customer_id and category_id
      if (fieldName === "category") {
        form.setValue(fieldName, Number(value));
      } else {
        form.setValue(fieldName, value as any);
      }
    };
  };

  const onSubmit = async (data: InquiryDefaultFormValues) => {
    try {
      const res = await api.post<ApiResponse<InquryDefault>>(
        `/agencies/${user.agency.id}/settings`,
        {
          settings: data,
        }
      );
      if (res.status === 200) {
        toast.success("Default values saved successfully");
      }
    } catch (error) {
      toast.error("Failed to save default values");
    }
  };

  return (
    <>
      <h2 className="text-lg md:text-2xl font-bold mb-4">Default Values</h2>
      <div className="grid md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              New Inquiry{" "}
              <span className="text-muted-foreground">Default Values</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Default location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followup_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <Select
                        onValueChange={handleSelectChange("followup_date")}
                        value={String(field.value)}
                        key={`category-${field.value}`} // Force re-render on value change
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empty">Empty</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={handleSelectChange("category")}
                        value={String(field.value)}
                        key={`category-${field.value}`} // Force re-render on value change
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat: Category) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

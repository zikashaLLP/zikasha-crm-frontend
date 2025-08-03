// edit-customer-modal.tsx
import { useEffect } from "react";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type User = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
  agency_id: number;
};

type EditUserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdated: (customer: User) => void;
};

// Edit 
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("").transform(() => undefined)),
  role: z.enum(["admin", "staff"], {
    errorMap: () => ({ message: "Role is required" }),
  })
});

type UserFormValues = z.infer<typeof userSchema>;

export default function EditUserModal({
  open,
  onOpenChange,
  user,
  onUpdated,
}: EditUserModalProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
    }
  });

  // Reset form when customer changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email || "",
        role: (user.role === "admin" || user.role === "staff" ? user.role : "staff"),
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserFormValues) => {
    if (!user) return;

    try {
      // The schema transformation handles empty strings, but we can be explicit
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role
      };

      const res = await api.put<User>(`/agencies/${user?.agency_id}/users/${user.id}`, payload);

      toast.success("Customer updated");
      onUpdated(res.data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email (optional)" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    key={`role-${field.value}`} // Force re-render on value change
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Customer</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
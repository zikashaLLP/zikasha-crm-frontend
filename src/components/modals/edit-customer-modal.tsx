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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/api/axios";

type Customer = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

type EditCustomerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onUpdated: (customer: Customer) => void;
};

// Same schema as add customer modal
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().optional().or(z.literal("").transform(() => undefined)),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function EditCustomerModal({
  open,
  onOpenChange,
  customer,
  onUpdated,
}: EditCustomerModalProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
      });
    }
  }, [customer, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    if (!customer) return;

    try {
      // The schema transformation handles empty strings, but we can be explicit
      const payload = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      };

      const res = await api.put<Customer>(`/customers/${customer.id}`, payload);

      toast.success("Customer updated");
      onUpdated(res.data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
    }
  };

  if (!customer) return null;

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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone (optional)" {...field} />
                  </FormControl>
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
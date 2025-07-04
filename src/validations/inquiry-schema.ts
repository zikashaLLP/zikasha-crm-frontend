import * as z from "zod";

export const inquirySchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  categoryId: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  followupDate: z.string().min(1, "Follow-up date is required"),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

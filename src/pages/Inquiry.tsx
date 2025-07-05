import * as z from "zod";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddCustomerModal from "@/components/modals/add-customer-modal";
import { toast } from "sonner";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";

// Zod schema
const inquirySchema = z.object({
	customer_id: z.number().min(1, "Customer is required"),
	category_id: z.number().min(1, "Category is required"),
	location: z.string().min(1, "Location is required"),
	followup_date: z.string().min(1, "Follow-up date is required"),
});

// TypeScript types
type InquiryFormValues = z.infer<typeof inquirySchema>;

interface Customer {
	id: number;
	name: string;
	email?: string;
	phone?: string;
	createdAt?: string;
	updatedAt?: string;
	agency_id?: number;
}

interface Category {
	id: number;
	name: string;
	slug: string;
}

interface ApiResponse<T> {
	data: T;
	message?: string;
	success?: boolean;
}

interface ApiError {
	response?: {
		data?: {
			message?: string;
		};
	};
	message?: string;
}

export default function Inquiry() {
	// Fix the default values type issue
	const form = useForm<InquiryFormValues>({
		resolver: zodResolver(inquirySchema),
		defaultValues: {
			customer_id: 0, // Initialize with 0 instead of empty string
			category_id: 0, // Initialize with 0 instead of empty string
			location: "",
			followup_date: "",
		},
	});

	const [customers, setCustomers] = useState<Customer[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [openCustomerModal, setOpenCustomerModal] = useState<boolean>(false);

	const navigate = useNavigate();

	useEffect(() => {
		async function fetchData(): Promise<void> {
			try {
				const [customersRes, categoriesRes] = await Promise.all([
					api.get<ApiResponse<Customer[]>>("/customers"),
					api.get<ApiResponse<Category[]>>("/categories"),
				]);
				setCustomers(customersRes.data.data || customersRes.data);
				setCategories(categoriesRes.data.data || categoriesRes.data);
			} catch (error) {
				const apiError = error as ApiError;
				console.error("Error fetching data:", apiError);
				toast.error("Failed to load customers or categories");
			}
		}
		fetchData();
	}, []);

	const onSubmit = async (data: InquiryFormValues): Promise<void> => {
		console.log("Submitting inquiry data:", data);

		try {
			await api.post<ApiResponse<any>>("/inquiries", data);
			toast.success("Inquiry created");
			// Redirect to dashboard
			setTimeout(() => {
				form.reset();
				navigate("/dashboard");
			}, 1000);
		} catch (error) {
			const apiError = error as ApiError;
			console.error("Error creating inquiry:", apiError);
			toast.error(apiError.response?.data?.message || "Something went wrong while creating inquiry");
		}
	};

	const handleCustomerCreated = (newCustomer: Customer): void => {
		setCustomers((prev) => [...prev, newCustomer]);
		form.setValue("customer_id", newCustomer.id); // Now properly typed as number
	};

	const handleSelectChange = (fieldName: keyof InquiryFormValues) => {
		return (value: string) => {
			// Convert string to number for customer_id and category_id
			if (fieldName === 'customer_id' || fieldName === 'category_id') {
				form.setValue(fieldName, Number(value));
			} else {
				form.setValue(fieldName, value as any);
			}
		};
	};

	const handleDateSelect = (date: Date | undefined): void => {
		if (date) {
			form.setValue("followup_date", date.toISOString());
		}
	};

	return (
		<div className="max-w-7xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Create New Inquiry</CardTitle>
					<CardDescription>Fill out the form below to create a new inquiry.</CardDescription>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<FormItem>
										<FormLabel>Date</FormLabel>
										<FormControl>
											<Input
												type="date"
												defaultValue={format(new Date(), "yyyy-MM-dd")}
												disabled={true} // Disable date input, use calendar instead
											/>
										</FormControl>
									</FormItem>
								</div>
								{/* Customer Select + Add */}
								<div className="flex items-end gap-2">
									<FormField
										control={form.control}
										name="customer_id"
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormLabel>Customer</FormLabel>
												<Select
													onValueChange={handleSelectChange('customer_id')}
													value={String(field.value)}
													key={`customer-${field.value}`} // Force re-render on value change
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select customer" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{customers.map((cust: Customer) => (
															<SelectItem key={cust.id} value={String(cust.id)}>
																{cust.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									{/* Add Customer Button */}
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={() => setOpenCustomerModal(true)}
											>
												<Plus className="w-4 h-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											Add new customer
										</TooltipContent>
									</Tooltip>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Category Select */}
								<FormField
									control={form.control}
									name="category_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category</FormLabel>
											<Select
												onValueChange={handleSelectChange('category_id')}
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
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Location */}
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<Input placeholder="Enter location" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Follow-up Date */}
								<FormField
									control={form.control}
									name="followup_date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Follow-up Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className="w-full justify-start text-left"
														>
															{field.value ? (
																format(new Date(field.value), "PPP")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent>
													<Calendar
														mode="single"
														selected={field.value ? new Date(field.value) : undefined}
														onSelect={handleDateSelect}
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Creating..." : "Create Inquiry"}
							</Button>
						</form>
					</Form>

					<AddCustomerModal
						open={openCustomerModal}
						onOpenChange={setOpenCustomerModal}
						onCreated={handleCustomerCreated}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
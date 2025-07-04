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

const inquirySchema = z.object({
	customer_id: z.number().min(1, "Customer is required"),
	category_id: z.number().min(1, "Category is required"),
	location: z.string().min(1, "Location is required"),
	followup_date: z.string().min(1, "Follow-up date is required"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

type Customer = {
	id: string;
	name: string;
	email?: string;
	phone?: string;
};

type Category = {
	id: string;
	name: string;
};

export default function Inquiry() {
	const form = useForm<InquiryFormValues>({
		resolver: zodResolver(inquirySchema),
		defaultValues: {
			customer_id: "",
			category_id: "",
			location: "",
			followup_date: "",
		},
	});

	const [customers, setCustomers] = useState<Customer[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [openCustomerModal, setOpenCustomerModal] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		async function fetchData() {
			try {
				const [customersRes, categoriesRes] = await Promise.all([
					api.get<Customer[]>("/customers"),
					api.get<Category[]>("/categories"),
				]);
				setCustomers(customersRes.data);
				setCategories(categoriesRes.data);
			} catch (error) {
				toast.error("Failed to load customers or categories");
			}
		}
		fetchData();
	}, []);

	const onSubmit = async (data: InquiryFormValues) => {
		console.log("Submitting inquiry data:", data);

		try {
			await api.post("/inquiries", data);
			toast.success("Inquiry created");
			// Redirect to dashboard
			setTimeout(() => {
				form.reset();
				navigate("/dashboard");
			}, 1000);
		} catch (error) {
			toast.error("Something went wrong while creating inquiry");
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
													onValueChange={(value) => {
														field.onChange(value);
													}}
													value={field.value}
													key={`customer-${field.value}`} // Force re-render on value change
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select customer" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{customers.map((cust) => (
															<SelectItem key={cust.id} value={cust.id}>
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
												onValueChange={(value) => {
													field.onChange(value);
												}}
												value={field.value}
												key={`category-${field.value}`} // Force re-render on value change
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{categories.map((cat) => (
														<SelectItem key={cat.id} value={cat.id}>
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
														onSelect={(date) => field.onChange(date?.toISOString())}
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit">Create Inquiry</Button>
						</form>
					</Form>

					<AddCustomerModal
						open={openCustomerModal}
						onOpenChange={setOpenCustomerModal}
						onCreated={(newCustomer: Customer) => {
							setCustomers((prev) => [...prev, newCustomer]);
							form.setValue("customer_id", newCustomer.id);
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
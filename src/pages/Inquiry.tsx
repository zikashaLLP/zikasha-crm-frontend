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
import { useContext, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import { format, set } from "date-fns";
import { CalendarIcon, Plus, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import AddCustomerModal from "@/components/modals/add-customer-modal";
import { toast } from "sonner";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";

// Zod schema
const inquirySchema = z.object({
	customer_id: z.number().min(1, "Customer is required"),
	category_id: z.number().min(1, "Category is required"),
	location: z.string(),
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
	const [openCustomerCombo, setOpenCustomerCombo] = useState<boolean>(false);
	const [settings, setSettings] = useState<any | null>(null);

	const { user } = useContext(AuthContext);

	const navigate = useNavigate();

	useEffect(() => {
		async function fetchData(): Promise<void> {
			try {
				const [customersRes, categoriesRes, settingsRes] = await Promise.all([
					api.get("/customers"),
					api.get<ApiResponse<Category[]>>("/categories"),
					api.get(`/agencies/${user.agency.id}/settings`),
				]);
				setCustomers(customersRes.data.customers);
				setCategories(categoriesRes.data.data || categoriesRes.data);
				setSettings(settingsRes.data.settings);
			} catch (error) {
				toast.error("Failed to load customers or categories");
			}
		}
		fetchData();
	}, []);

	useEffect(() => {
		if (settings) {
			if (settings.location) {
				form.setValue("location", settings.location);
			}
			if (settings.followup_date && settings.followup_date !== "" && settings.followup_date !== "empty") {
				const date = getDefaultFollowupDate(settings.followup_date);
				form.setValue("followup_date", date ? date.toUTCString() : "");
			}
			if (settings.category) {
				form.setValue("category_id", settings.category);
			}
		}
	}, [settings]);

	const  getDefaultFollowupDate = (day: string) => {
		if (day === "today") {
			return new Date();
		}
		if (day === "tomorrow") {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			return set(tomorrow, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });
		}
		if (day === "next_week") {
			const nextWeek = new Date();
			nextWeek.setDate(nextWeek.getDate() + 7);
			return set(nextWeek, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });
		}
	}

	const onSubmit = async (data: InquiryFormValues): Promise<void> => {

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
			date.setHours(10, 0, 0, 0); // Reset time to 10:00 AM
			form.setValue("followup_date", date.toUTCString()); // Store as UTC string
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
								{/* Customer Combobox + Add */}
								<div className="flex items-end gap-2">
									<FormField
										control={form.control}
										name="customer_id"
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormLabel>Customer</FormLabel>
												<Popover open={openCustomerCombo} onOpenChange={setOpenCustomerCombo}>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																role="combobox"
																aria-expanded={openCustomerCombo}
																className="w-full justify-between"
															>
																{field.value && field.value > 0
																	? customers.find((customer) => customer.id === field.value)?.name
																	: "Select customer..."}
																<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-full p-0">
														<Command>
															<CommandInput placeholder="Search customer..." />
															<CommandList className="max-h-40 md:max-h-[300px]">
																<CommandEmpty>No customer found.</CommandEmpty>
																<CommandGroup>
																	{customers.map((customer) => (
																		<CommandItem
																			key={customer.id}
																			value={`${customer.name} (${customer.phone})`}
																			onSelect={() => {
																				form.setValue("customer_id", customer.id);
																				setOpenCustomerCombo(false);
																			}}
																		>
																			<Check
																				className={cn(
																					"mr-2 h-4 w-4",
																					field.value === customer.id ? "opacity-100" : "opacity-0"
																				)}
																			/>
																			<div>
																				<div className="name">{customer.name}</div>
																				<div className="text-sm text-muted-foreground">
																					{customer.phone ? customer.phone : '-'}
																				</div>
																			</div>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
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
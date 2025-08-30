import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

// Type definitions
export interface Category {
    id: number | string;
    name: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    agency_id?: number;
}

type AddLogFormProps = {
	categories: Category[];
	category_id?: number;
	inquiry_id?: number;
	setShowInquiryModal: (show: boolean) => void;
};

const inquiryLogSchema = z.object({
	inquiry_id: z.number(),
	category_id: z.number().min(1, "Status is required"),
	followup_date: z.string().min(1, "Follow-up date is required"),
	followup_time: z.string(),
	content: z.string().min(1, "Comment is required"),
});

type InquiryLogFormValues = z.infer<typeof inquiryLogSchema>;

function AddLogForm({ 
	categories, 
	category_id, 
	inquiry_id, 
	setShowInquiryModal 
}: AddLogFormProps) {
	const form = useForm<InquiryLogFormValues>({
		resolver: zodResolver(inquiryLogSchema),
		defaultValues: {
			inquiry_id: inquiry_id || 0,
			category_id: category_id || 0,
			followup_date: "",
			followup_time: "10:00",
			content: "",
		},
	});

	const handleDateSelect = (date: Date | undefined): void => {
		if (date) {
			form.setValue("followup_date", date.toDateString());
		}
	};

	const onSubmit = async (data: InquiryLogFormValues) => {
		let oldCategory = categories.find(cat => cat.id === category_id);
		let newCategory = categories.find(cat => cat.id === data.category_id);

		if (!newCategory) {
			toast.error("Invalid category selection");
			return;
		}

		if (!oldCategory) {
			oldCategory = {
				id: 0,
				name: "Unknown",
			}
		}

		const hint = `Status changed from <b>${oldCategory.name}</b> to <b>${newCategory.name}</b>`;

		
		// Combine followup_date and followup_time in local timezone
		let processedData = { ...data };
	
		// Add followup_time to followup_date if both are provided and convert to UTC format
		if (processedData.followup_date && processedData.followup_time) {
			const newDate = new Date(processedData.followup_date);
			const [hours, minutes] = processedData.followup_time.split(":").map(Number);
			newDate.setHours(hours, minutes, 0, 0);
			// Convert to UTC string
			processedData.followup_date = newDate.toUTCString();
		} else {
			processedData.followup_date = new Date(processedData.followup_date).toUTCString(); // Default to current date if not set
		}


		try {
			await api.post("/logs", { hint, ...processedData });
			toast.success("Log added successfully");
			form.reset();
			// Close modal
			setTimeout(() => {
				setShowInquiryModal(false);
				window.location.reload(); // Reload to show new log
			}, 500); // Delay to allow toast to show
			
		} catch (error) {
			console.error("Error adding log:", error);
			toast.error("Something went wrong while adding new log");
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

				{/* Category Select */}
				<FormField
					control={form.control}
					name="category_id"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select
								onValueChange={(value) => {
									field.onChange(Number(value));
								}}
								value={field.value?.toString()}
								key={`category-${field.value}`} // Force re-render on value change
							>
								<FormControl className="w-full">
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem key={cat.id} value={cat.id.toString()}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Followup Date */}
					<FormField
						control={form.control}
						name="followup_date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Follow-up Date</FormLabel>
								<Popover modal={true}>
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

					{/* Followup Time */}
					<FormField
						control={form.control}
						name="followup_time"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Follow-up Time</FormLabel>
								<FormControl>
									<input
										type="time"
										{...field}
										// Default value to 10:00 AM if not set
										defaultValue={field.value || "10:00"}
										className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

				</div>

				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Comment</FormLabel>
							<FormControl>
								<textarea
									{...field}
									className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={4}
									placeholder="Enter your comment here"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">
					Add Log
				</Button>

			</form>
		</Form>
	);
}

export default AddLogForm;
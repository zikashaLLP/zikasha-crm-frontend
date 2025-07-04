import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";

import { Button } from "@/components/ui/button";
import { Plus, User, Phone, CalendarIcon, MapPinIcon, ContactIcon, MailIcon, MoreVerticalIcon, NotebookIcon } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getDateRange } from "@/utils/dates"

export default function Dashboard() {
	const [categories, setCategories] = useState([]);
	const [selectedCategoryId, setSelectedCategoryId] = useState(null);
	const [inquiries, setInquiries] = useState([]);
	const [loadingInquiries, setLoadingInquiries] = useState(false);
	const [selectedInquiry, setSelectedInquiry] = useState(null);
	const [showInquiryModal, setShowInquiryModal] = useState(false);
	const [showContactModal, setShowContactModal] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

	// Listen for screen resize to update isDesktop
	useEffect(() => {
		const handleResize = () => {
			setIsDesktop(window.innerWidth >= 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Load categories once.
	useEffect(() => {
		api
			.get("/categories")
			.then((res) => setCategories(res.data))
			.catch(() => toast.error("Failed to load categories"));
	}, []);

	// Load inquiries when selectedCategoryId changes.
	useEffect(() => {
		setLoadingInquiries(true);

		let url = selectedCategoryId
			? `/inquiries?category_id=${selectedCategoryId}`
			: "/inquiries";

		if (
			selectedCategoryId &&
			['today', 'tomorrow', 'this-week', 'next-week'].includes(selectedCategoryId)
		) {
			const { followup_date_start, followup_date_end } = getDateRange(selectedCategoryId);

			if (followup_date_start === followup_date_end) {
				url = `/inquiries?followup_date=${followup_date_start}`;
			} else if (followup_date_start && followup_date_end) {
				url = `/inquiries?followup_date_start=${followup_date_start}&followup_date_end=${followup_date_end}`;
			}
		}

		api
			.get(url)
			.then((res) => setInquiries(res.data))
			.catch(() => toast.error("Failed to load inquiries"))
			.finally(() => setLoadingInquiries(false));
	}, [selectedCategoryId]);

	const handleInquiryClick = (inquiry) => {
		setSelectedInquiry(inquiry);
		setShowInquiryModal(true);
	};

	const handleContactClick = (inquiry) => {
		setSelectedInquiry(inquiry);
		setShowContactModal(true);
	};

	const closeModal = () => {
		setShowInquiryModal(false);
		setSelectedInquiry(null);
	};

	const deleteInquiry = async (inquiryId) => {
		try {
			await api.delete(`/inquiries/${inquiryId}`);
			toast.success("Inquiry deleted successfully");
			setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId));
		} catch (error) {
			toast.error("Failed to delete inquiry");
		}
	};

	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-lg md:text-2xl font-bold">Inquiries</h1>
				<Button
					asChild
				>
					<Link to="/dashboard/inquiries/new">
						<Plus />
						Add Inquiry
					</Link>
				</Button>
			</div>

			{/* Categories Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
				{/* Add an "All" card */}
				<CategoryCard
					category={{ id: null, name: "All" }}
					selected={selectedCategoryId === null}
					onClick={() => setSelectedCategoryId(null)}
				/>

				<CategoryCard
					category={{ id: 'today', name: "Today's calls" }}
					selected={selectedCategoryId === 'today'}
					onClick={() => setSelectedCategoryId('today')}
				/>

				<CategoryCard
					category={{ id: 'tomorrow', name: "Tomorrow's calls" }}
					selected={selectedCategoryId === 'tomorrow'}
					onClick={() => setSelectedCategoryId('tomorrow')}
				/>

				<CategoryCard
					category={{ id: 'this-week', name: "This Week" }}
					selected={selectedCategoryId === 'this-week'}
					onClick={() => setSelectedCategoryId('this-week')}
				/>

				<CategoryCard
					category={{ id: 'next-week', name: "Next Week" }}
					selected={selectedCategoryId === 'next-week'}
					onClick={() => setSelectedCategoryId('next-week')}
				/>

				{categories.map((category) => (
					<CategoryCard
						key={category.id}
						category={category}
						selected={selectedCategoryId === category.id}
						onClick={() => setSelectedCategoryId(category.id)}
					/>
				))}
			</div>

			{/* Inquiries list */}
			<section>
				<h2 className="mb-4 text-base font-semibold">
					{selectedCategoryId ? (
						<span>
							{categories.find((c) => c.id === selectedCategoryId)?.name || ""}{" "}
							Inquiries
						</span>
					) : (
						"All Inquiries"
					)}
				</h2>

				{loadingInquiries ? (
					<Loading />
				) : inquiries.length === 0 ? (
					<p className="text-gray-500 text-center py-4">No inquiry found!</p>
				) : (
					<>
						{
							isDesktop && (
								<div className="overflow-x-auto rounded-md border mb-8">
									<table className="w-full table-auto border-collapse bg-white">
										<thead className="bg-gray-100 border-b">
											<tr>
												<th className="px-4 py-2 text-left font-semibold">
													Date
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Client
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Contact No.
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Status
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Location
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Follow-up Date
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													&nbsp; {/* Empty header for spacing */}
												</th>
											</tr>
										</thead>
										<tbody className="text-sm">
											{inquiries.map((inquiry) => (
												<tr
													key={inquiry?.id}
													className={`hover:bg-gray-50 border-b last:border-b-0 ${selectedInquiry?.id === inquiry?.id ? 'bg-gray-50' : ''} `}
												>
													<td className="px-4 py-2">
														{new Date(inquiry?.createdAt).toLocaleDateString()}
													</td>
													<td
														className="px-4 py-2 cursor-pointer"
														onClick={() => handleContactClick(inquiry)}
													>
														{inquiry?.Customer?.name || "N/A"}
													</td>
													<td className="px-4 py-2">
														{inquiry?.Customer?.phone || "N/A"}
													</td>
													<td
														className="px-4 py-2 cursor-pointer"
														onClick={() => handleInquiryClick(inquiry)}
													>
														{
															inquiry?.Category?.name ?
																<code
																	className="px-2 py-1 bg-blue-100 rounded"
																>{inquiry.Category?.name}</code>
																: (
																	<span className="text-gray-500">N/A</span>
																)
														}
													</td>
													<td className="px-4 py-2">{inquiry?.location || "-"}</td>
													<td className="px-4 py-2">
														{inquiry?.followup_date
															? new Date(inquiry?.followup_date).toLocaleDateString()
															: "-"}
													</td>
													<td className="px-4 py-2">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="icon">
																	<MoreVerticalIcon className="h-5 w-5" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	onClick={() => handleInquiryClick(inquiry)}
																>
																	View Logs
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => handleContactClick(inquiry)}
																>
																	View Contact
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => {
																		setSelectedInquiry(inquiry);
																		setShowDeleteDialog(true);
																	}}
																	className="text-red-600 hover:text-red-800 focus:bg-red-100 focus:text-red-700"
																>
																	Delete Inquiry
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)
						}

						{/* Mobile view */}
						<div>
							{
								!isDesktop && inquiries.length > 0 && (
									inquiries.map((inquiry) => (
										<Card key={inquiry.id} className="p-3 mb-10 relative">
											<CardHeader className="p-0">
												<div className="flex justify-between items-center">
													{/* createdAt */}
													<div className="text-sm">
														{new Date(inquiry.createdAt).toLocaleDateString()}
													</div>
													{/* location */}
													{
														inquiry.location &&
														<div className="text-sm flex items-center gap-1">
															<MapPinIcon className="w-4 h-4" />
															{inquiry.location || ""}
														</div>
													}
												</div>
											</CardHeader>
											<CardContent className="p-0">
												{/* Name, followup_date, status */}
												<div className="space-y-2 text-sm">
													<div className="flex items-center gap-2">
														<User className="w-5 h-5" />
														<span className="font-semibold">
															{inquiry.Customer?.name || "N/A"}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<CalendarIcon className="w-5 h-5" />
														<span>
															{inquiry.followup_date
																? new Date(inquiry.followup_date).toLocaleDateString()
																: "-"}
														</span>
													</div>
													{
														inquiry.latest_log &&
														<div className="flex items-center gap-2">
															<NotebookIcon className="w-5 h-5" />
															<span>
																{inquiry.latest_log}
															</span>
														</div>
													}
													<div className="flex items-center gap-2 mt-2 mb-2">
														<code 
															className="px-2 py-1 bg-blue-100 rounded"
															onClick={() => handleInquiryClick(inquiry)}
														>
															{inquiry.Category?.name || "N/A"}
														</code>
													</div>
												</div>
												<div className="absolute -bottom-6 left-4">
													<div className="flex gap-2">
														{
															inquiry.Customer?.phone && inquiry.Customer?.phone !== "" &&
															<>
																<Button
																	variant="icon"
																	size="sm"
																	className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
																	onClick={() => window.open(`tel:+91${inquiry.Customer?.phone}`, "_blank")}
																>
																	<Phone className="w-4 h-4" />
																</Button>
																<Button
																	variant="icon"
																	size="sm"
																	className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
																	onClick={() => window.open(`https://wa.me/91${inquiry.Customer?.phone}`, "_blank")}
																>
																	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
																		<path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
																	</svg>
																</Button>
															</>
														}
													</div>
												</div>
											</CardContent>
										</Card>
									))
								)
							}
						</div>
					</>
				)}
			</section>

			{/* Delete Inquiry Dialog Alert */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Inquiry</DialogTitle>
					</DialogHeader>
					<p>Are you sure you want to delete this inquiry?</p>
					<div className="flex justify-end mt-4">
						<Button
							variant="outline"
							className="mr-2"
							onClick={() => setShowDeleteDialog(false)}
						>Cancel</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (selectedInquiry) {
									deleteInquiry(selectedInquiry.id);
									setSelectedInquiry(null);
								}
								setShowDeleteDialog(false);
							}}
						>Delete</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Contact Details Modal */}
			<Dialog open={showContactModal} onOpenChange={setShowContactModal}>
				<DialogContent className="min-w-fit max-h-[90vh] min overflow-hidden">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							Contact Details
						</DialogTitle>
					</DialogHeader>

					{selectedInquiry && (
						<div className="p-4 border rounded-md space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
								{
									selectedInquiry.Customer?.name &&
									<div className="flex items-center gap-2">
										<User className="w-5 h-5" />
										<p>{selectedInquiry.Customer?.name || "N/A"}</p>
									</div>
								}
								{
									selectedInquiry.location &&
									<div className="flex items-center gap-2">
										<MapPinIcon className="w-5 h-5" />
										<p>{selectedInquiry.location || ""}</p>
									</div>
								}
								{
									selectedInquiry.Customer?.phone &&
									<div className="flex items-center gap-2">
										<ContactIcon className="w-5 h-5" />
										<p>+91 {selectedInquiry.Customer?.phone}</p>
									</div>
								}
								{
									selectedInquiry?.followup_date &&
									<div className="flex items-center gap-2">
										<CalendarIcon className="w-5 h-5" />
										{/* Display date time in Indian time dd/mm/yyy hh:mm AM/PM */}
										<p>
											{new Date(selectedInquiry?.followup_date).toLocaleDateString("en-IN", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
											})}{"  "}
											{new Date(selectedInquiry?.followup_date).toLocaleTimeString("en-IN", {
												hour: "2-digit",
												minute: "2-digit",
												hour12: true,
											})?.toUpperCase()}
										</p>
									</div>
								}
							</div>
							<hr />
							<div className="flex gap-4 items-center">
								{
									selectedInquiry.Customer?.email && selectedInquiry.Customer?.email !== "" &&
									<Button
										variant="outline"
										size="sm"
										className="bg-red-200 hover:bg-red-300 ring-blue-100"
										onClick={() => window.open(`mailto:${selectedInquiry.Customer?.email}`, "_blank")}
									>
										<MailIcon className="w-4 h-4" />
										Email
									</Button>
								}
								{
									selectedInquiry.Customer?.phone && selectedInquiry.Customer?.phone !== "" &&
									<>
										<Button
											variant="outline"
											size="sm"
											className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
											onClick={() => window.open(`tel:+91${selectedInquiry.Customer?.phone}`, "_blank")}
										>
											<Phone className="w-4 h-4" />
											Call
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
											onClick={() => window.open(`https://wa.me/91${selectedInquiry.Customer?.phone}`, "_blank")}
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
												<path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
											</svg>
											WhatsApp
										</Button>
									</>
								}
								{ }
							</div>
						</div>
					)}

				</DialogContent>
			</Dialog>

			{/* Inquiry Details Modal */}
			<Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
				<DialogContent className="min-w-fit max-h-[90vh] min overflow-hidden">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							Inquiry Details
						</DialogTitle>
					</DialogHeader>

					{selectedInquiry && (
						<Tabs defaultValue="account">
							<TabsList className="grid w-full grid-cols-3 p-1 h-auto bg-gray-100">
								<TabsTrigger className="p-2" value="view-log">View Log</TabsTrigger>
								<TabsTrigger className="p-2" value="add-log">Add Log</TabsTrigger>
								<TabsTrigger className="p-2" value="add-visit">Add Visit</TabsTrigger>
							</TabsList>
							<TabsContent value="view-log">
								<div className="p-4 border rounded-md  max-h-[60vh] overflow-y-auto">
									<ViewLog inquiryId={selectedInquiry?.id} />
								</div>
							</TabsContent>
							<TabsContent value="add-log">
								<div className="p-4 border rounded-md">
									<AddLogForm
										categories={categories}
										category_id={selectedInquiry?.category_id}
										inquiry_id={selectedInquiry?.id}
										setShowInquiryModal={setShowInquiryModal}
									/>
								</div>
							</TabsContent>
							<TabsContent value="add-visit">Add Visit</TabsContent>
						</Tabs>
					)}

				</DialogContent>
			</Dialog>
		</div>
	);
}

import * as z from "zod";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function AddLogForm({ categories, category_id, inquiry_id, setShowInquiryModal }) {

	const inquiryLogSchema = z.object({
		inquiry_id: z.number(),
		category_id: z.number().min(1, "Status is required"),
		followup_date: z.string().min(1, "Follow-up date is required"),
		followup_time: z.string(),
		content: z.string().min(1, "Comment is required"),
	});

	type InquiryLogFormValues = z.infer<typeof inquiryLogSchema>;

	const form = useForm<InquiryLogFormValues>({
		resolver: zodResolver(inquiryLogSchema),
		defaultValues: {
			inquiry_id: inquiry_id || "",
			category_id: category_id || "",
			followup_date: "",
			followup_time: "10:10",
			content: "",
		},
	});

	// Helper function to format date in local timezone
	const formatDateForStorage = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const onSubmit = async (data: InquiryLogFormValues) => {
		const oldCategory = categories.find(cat => cat.id === category_id) || '';
		const newCategory = categories.find(cat => cat.id === data.category_id) || '';

		const hint = 'Status changed from <b>' + oldCategory.name + '</b> to <b>' + newCategory.name + '</b>';

		console.log("Form Data:", data);
		
		// Combine followup_date and followup_time in local timezone
		if (data.followup_date && data.followup_time) {
			// Extract the date part from followup_date (YYYY-MM-DD)
			const datePart = data.followup_date.split('T')[0];
			// Create a local datetime string (without Z to avoid UTC conversion)
			data.followup_date = `${datePart}T${data.followup_time}:00.000`;
		} else if (data.followup_date && !data.followup_time) {
			// Keep original followup_date if no followup_time provided
			// Or set default time if needed
			const datePart = data.followup_date.split('T')[0];
			data.followup_date = `${datePart}T10:00:00.000`;
		}

		try {
			await api.post("/logs", { hint, ...data });
			toast.success("Log added successfully");
			form.reset();
			// Close modal
			setTimeout(() => {
				setShowInquiryModal(false);
				window.location.reload(); // Reload to show new log
			}, 500); // Delay to allow toast to show
			
		} catch (error) {
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
									field.onChange(value);
								}}
								value={field.value}
								key={`category-${field.value}`} // Force re-render on value change
							>
								<FormControl className="w-full">
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Followup Date */}
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
											onSelect={(date) => {
												if (date) {
													// Store date in YYYY-MM-DD format to avoid timezone issues
													const formattedDate = formatDateForStorage(date);
													field.onChange(formattedDate);
												}
											}}
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
	)
};

function ViewLog({ inquiryId }) {

	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true);
			try {
				const response = await api.get(`/logs/inquiry/${inquiryId}`);
				setLogs(response.data);
			} catch (error) {
				toast.error("Failed to load logs");
			} finally {
				setLoading(false);
			}
		};

		if (inquiryId) {
			fetchLogs();
		}
	}, [inquiryId]);

	return (
		<div>
			{
				loading ? (
					<Loading />
				) : logs.length === 0 ? (
					<p className="text-gray-500 text-center py-4">No log added for this inquiry!</p>
				) : null
			}
			{
				logs?.map((log) => (
					<div key={log.id} className="mb-4 p-3 border rounded-md bg-gray-50">
						<div className="flex justify-between items-center mb-2 gap-4">
							{
								log?.hint ? (
									<div
										className="text-sm px-2 bg-gray-200 rounded -mx-2"
										dangerouslySetInnerHTML={{ __html: log.hint }}
									/>
								) : <div></div>
							}
							<div className="text-sm">{new Date(log?.createdAt).toLocaleDateString()}</div>
						</div>
						<p className="mb-2">{log?.content}</p>
						<p className="text-gray-800 text-sm">
							<strong className="font-semibold">Follow up Date: </strong>
							{
								log?.followup_date
									? new Date(log?.followup_date).toLocaleDateString()
									: ""
							}
						</p>
					</div>
				))
			}
		</div>
	);
}


// Simple category card component
function CategoryCard({ category, selected, onClick }) {
	return (
		<div
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick();
			}}
			className={`cursor-pointer rounded-lg border p-4 transition
        ${selected
					? "ring-2 ring-blue-500 bg-blue-100"
					: "border hover:shadow-sm"
				}`}
		>
			<h3 className="font-medium text-gray-900">{category.name}</h3>
		</div>
	);
}
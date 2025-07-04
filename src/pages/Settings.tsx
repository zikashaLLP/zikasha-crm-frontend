import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Loading from "@/components/Loading";

import { toast } from "sonner";
import api from "@/api/axios";
import { Plus, MoreVerticalIcon } from "lucide-react";

// Zod schema
const categorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens only"),
});

// Slugify function
function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/[\s\W-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export default function Settings() {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch categories
	const fetchCategories = () => {
		setLoading(true);
		api
			.get("/categories")
			.then((res) => setCategories(res.data))
			.catch(() => toast.error("Failed to load categories"))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	// React Hook Form with Zod
	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(categorySchema),
	});

	// Track if slug manually edited
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const nameValue = watch("name");

	// Auto update slug from name if slug not manually edited
	useEffect(() => {
		if (!slugManuallyEdited && nameValue) {
			const newSlug = slugify(nameValue);
			setValue("slug", newSlug, { shouldValidate: true });
		}
	}, [nameValue, slugManuallyEdited, setValue]);

	function onSlugChange(e) {
		setSlugManuallyEdited(true);
		setValue("slug", e.target.value);
	}

	async function onSubmit(data) {
		try {
			await api.post("/categories", data);
			toast.success("Category created successfully!");
			reset();
			setSlugManuallyEdited(false);
			setIsModalOpen(false);
			fetchCategories();
		} catch (err) {
			toast.error("Failed to create category.");
		}
	}

	async function deleteCategory(categoryId) {
		if (!window.confirm("Are you sure you want to delete this category?")) return;

		try {
			await api.delete(`/categories/${categoryId}`);
			toast.success("Category deleted successfully!");
			setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
		} catch (err) {
			toast.error("Failed to delete category.");
		}
	}

	return (
		<div className="max-w-5xl mx-auto">

			<div className="flex justify-between items-center mb-6">
				<h1 className="text-lg md:text-2xl font-bold">Category Settings</h1>
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<Button><Plus />Add Category</Button>
					</DialogTrigger>

					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New Category</DialogTitle>
							<DialogDescription>Enter the name for the new category.</DialogDescription>
						</DialogHeader>

						<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium mb-1">
									Name
								</label>
								<Input id="name" placeholder="Category name" {...register("name")} />
								{errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
							</div>

							<div>
								<label htmlFor="slug" className="block text-sm font-medium mb-1">
									Slug
								</label>
								<Input
									id="slug"
									placeholder="category-slug"
									{...register("slug")}
									onChange={onSlugChange}
									disabled={true}
								/>
								{errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>}
							</div>

							<div className="flex justify-end space-x-2">
								<DialogClose asChild>
									<Button type="button" variant="outline" disabled={isSubmitting}>
										Cancel
									</Button>
								</DialogClose>

								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Creating..." : "Create"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Categories Grid */}
			{loading ? (
				<Loading text="Loading categories..." />
			) : categories.length === 0 ? (
				<p>No categories found.</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6 gap-4 mb-8">
					{categories.map((category) => (
						<CategoryCard key={category.id} category={category} deleteCategory={deleteCategory} />
					))}
				</div>
			)}
		</div>
	);
}

function CategoryCard({ category, deleteCategory }) {

	return (
		<div className="cursor-default rounded-lg border border-gray-300 p-3 shadow-sm bg-white">
			<div className="flex justify-between items-center gap-3">
				<h3 className="text-base md:text-lg font-semibold">{category.name}</h3>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreVerticalIcon className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => {
								deleteCategory(category.id);
							}}
							className="text-red-600 hover:text-red-800 focus:bg-red-100 focus:text-red-700"
						>
							Delete Category
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

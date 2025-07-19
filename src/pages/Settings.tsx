import React from "react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, MoreVerticalIcon, Edit } from "lucide-react";

// Type definitions
interface Category {
	id: number;
	name: string;
	slug: string;
	exclude_from_search: boolean;
	createdAt: string;
	updatedAt: string;
	agency_id: number;
}

interface CategoryCardProps {
	category: Category;
	deleteCategory: (categoryId: number) => Promise<void>;
	editCategory: (category: Category) => void;
}

// Zod schema
const categorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens only"),
	exclude_from_search: z.boolean().default(false),
});

// Type inference from Zod schema
type CategoryFormData = z.infer<typeof categorySchema>;

// Slugify function
function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/[\s\W-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export default function Settings() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	// Fetch categories
	const fetchCategories = (): void => {
		setLoading(true);
		api
			.get<Category[]>("/categories")
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
		control,
		formState: { errors, isSubmitting },
	} = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: "",
			slug: "",
			exclude_from_search: false,
		},
	});

	// Track if slug manually edited
	const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(false);
	const nameValue = watch("name");

	// Auto update slug from name if slug not manually edited
	useEffect(() => {
		if (!slugManuallyEdited && nameValue && !editingCategory) {
			const newSlug = slugify(nameValue);
			setValue("slug", newSlug, { shouldValidate: true });
		}
	}, [nameValue, slugManuallyEdited, setValue, editingCategory]);

	function onSlugChange(e: React.ChangeEvent<HTMLInputElement>): void {
		setSlugManuallyEdited(true);
		setValue("slug", e.target.value);
	}

	// Handle opening create modal
	function openCreateModal(): void {
		setEditingCategory(null);
		reset({
			name: "",
			slug: "",
			exclude_from_search: false,
		});
		setSlugManuallyEdited(false);
		setIsModalOpen(true);
	}

	// Handle opening edit modal
	function openEditModal(category: Category): void {
		setEditingCategory(category);
		reset({
			name: category.name,
			slug: category.slug,
			exclude_from_search: category.exclude_from_search || false,
		});
		setSlugManuallyEdited(true); // Don't auto-update slug when editing
		setIsModalOpen(true);
	}

	// Handle closing modal
	function closeModal(): void {
		setIsModalOpen(false);
		setEditingCategory(null);
		reset({
			name: "",
			slug: "",
			exclude_from_search: false,
		});
		setSlugManuallyEdited(false);
	}

	async function onSubmit(data: CategoryFormData): Promise<void> {
		try {
			console.log("Form data being submitted:", data); // Debug log
			
			if (editingCategory) {
				// Update existing category
				await api.put<Category>(`/categories/${editingCategory.id}`, data);
				toast.success("Category updated successfully!");
				setCategories((prev) =>
					prev.map((cat) =>
						cat.id === editingCategory.id
							? { ...cat, name: data.name, slug: data.slug, exclude_from_search: data.exclude_from_search }
							: cat
					)
				);
			} else {
				// Create new category
				await api.post<Category>("/categories", data);
				toast.success("Category created successfully!");
				fetchCategories();
			}
			closeModal();
		} catch (err) {
			console.error("Submit error:", err); // Debug log
			toast.error(editingCategory ? "Failed to update category." : "Failed to create category.");
		}
	}

	async function deleteCategory(categoryId: number): Promise<void> {
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
						<Button onClick={openCreateModal}>
							<Plus />Add Category
						</Button>
					</DialogTrigger>

					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingCategory ? "Edit Category" : "Create New Category"}
							</DialogTitle>
							<DialogDescription>
								{editingCategory 
									? "Update the category details below." 
									: "Enter the name for the new category."
								}
							</DialogDescription>
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
									disabled={!editingCategory && !slugManuallyEdited}
								/>
								{errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>}
							</div>

							<div className="flex items-center space-x-2">
								<Controller
									name="exclude_from_search"
									control={control}
									render={({ field }) => (
										<Checkbox
											id="exclude_from_search"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									)}
								/>
								<label
									htmlFor="exclude_from_search"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
								>
									Exclude from all inquiries
								</label>
							</div>

							<div className="flex justify-end space-x-2">
								<DialogClose asChild>
									<Button type="button" variant="outline" disabled={isSubmitting} onClick={closeModal}>
										Cancel
									</Button>
								</DialogClose>

								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting 
										? (editingCategory ? "Updating..." : "Creating...") 
										: (editingCategory ? "Update" : "Create")
									}
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
						<CategoryCard 
							key={category.id} 
							category={category} 
							deleteCategory={deleteCategory}
							editCategory={openEditModal}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function CategoryCard({ category, deleteCategory, editCategory }: CategoryCardProps) {
	return (
		<div className="cursor-default rounded-lg border border-gray-300 p-3 shadow-sm bg-white">
			<div className="flex justify-between items-center gap-3">
				<div className="flex flex-col">
					<h3 className="text-base md:text-lg font-semibold">{category.name}</h3>
					{category.exclude_from_search && (
						<span className="text-xs text-gray-500 mt-1">Excluded from inquiries</span>
					)}
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreVerticalIcon className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => editCategory(category)}
							className="hover:bg-blue-50 focus:bg-blue-100"
						>
							<Edit className="mr-2 h-4 w-4" />
							Edit Category
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => deleteCategory(category.id)}
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
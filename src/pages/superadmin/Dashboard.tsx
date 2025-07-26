import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Users,
  Building,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import api from "@/api/axios";
import { toast } from "sonner";
import ZCRMLogo from '../../assets/zcrm.svg';

// Types
interface Agency {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  Users?: User[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  agency_id: number;
}

// Schemas
const agencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.string().min(1, "Role is required"),
});

type AgencyFormData = z.infer<typeof agencySchema>;
type UserFormData = z.infer<typeof userSchema>;

export default function SuperadminDashboard() {
	const [agencies, setAgencies] = useState<Agency[]>([]);
	const [expandedAgencies, setExpandedAgencies] = useState<Set<number>>(
		new Set()
	);
	const [loading, setLoading] = useState(true);
	const [agencyDialogOpen, setAgencyDialogOpen] = useState(false);
	const [userDialogOpen, setUserDialogOpen] = useState(false);
	const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);

	// Agency form
	const agencyForm = useForm<AgencyFormData>({
		resolver: zodResolver(agencySchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	// User form
	const userForm = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
			defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "staff",
		},
	});

	// Load agencies
	const loadAgencies = async () => {
		try {
			setLoading(true);
			const res = await api.get('/agencies');
			setAgencies(res.data);
		} catch (error) {
			toast.error('Failed to fetch Agencies data');
		} finally {
			setLoading(false);
		}
	};

	// Load agency users
	const loadAgencyUsers = async (agencyId: number) => {
		try {
			const res = await api.get(`/agencies/${agencyId}/users`);
			const data = res.data;
			setAgencies((prev) =>
				prev.map((agency) =>
				agency.id === agencyId ? { ...agency, Users: data.users } : agency
				)
			);
		} catch (error) {
			toast.error('Failed to load agency users');
		}
	};

	// Toggle agency expansion
	const toggleAgency = async (agencyId: number) => {
		const newExpanded = new Set(expandedAgencies);
		if (newExpanded.has(agencyId)) {
			newExpanded.delete(agencyId);
		} else {
			newExpanded.add(agencyId);
			// Load users when expanding
			const agency = agencies.find((a) => a.id === agencyId);
			if (agency && !agency.Users) {
				await loadAgencyUsers(agencyId);
			}
		}
		setExpandedAgencies(newExpanded);
	};

	// Agency CRUD operations
	const handleCreateAgency = async (data: AgencyFormData) => {
		try {
			await api.post( '/agencies', data);
			toast.success('New Agency created successfully');
			await loadAgencies();
			setAgencyDialogOpen(false);
			agencyForm.reset();
		} catch (error) {
			toast.success('Failed to create new Agency');
		}
	};

	const handleUpdateAgency = async (data: AgencyFormData) => {
		if (!editingAgency) return;
		try {
			await api.put(
				`/agencies/${editingAgency.id}`,
				data
			)
			toast.success(`Agency ${editingAgency.name} updated successfully`);
			await loadAgencies();
			setAgencyDialogOpen(false);
			setEditingAgency(null);
			agencyForm.reset();
		} catch (error) {
			toast.error(`Failed to update agency`);
		}
	};

	const handleDeleteAgency = async (agency: Agency) => {
		if (!confirm("Are you sure you want to delete this agency?")) return;
		try {
			await api.delete(`/agencies/${agency.id}`);
			toast.success(`Agency ${agency.name} is deleted successfully`)
			await loadAgencies();
		} catch (error: any) {
			const message = error?.response?.data?.message || '';
			toast.error(`Failed to delete ${agency.name} agency! ${message}`);
		}
	};

	// User CRUD operations
	const handleCreateUser = async (data: UserFormData) => {
		if (!selectedAgencyId) return;
		try {
			await api.post('/auth/register', {
				...data,
				password: data.password || "password",
				agency_id: selectedAgencyId,
			})
			toast.success('New user created successfully');
			await loadAgencyUsers(selectedAgencyId);
			setUserDialogOpen(false);
			userForm.reset();
		} catch (error) {
			toast.error('Failed to create new user');
		}
	};

	const handleUpdateUser = async (data: UserFormData) => {
		if (!editingUser) return;
		try {
			await api.put(`/users/${editingUser.id}`, {
				name: data.name,
				email: data.email,
				role: data.role,
			});
			toast.success('User updated successfully');
			await loadAgencyUsers(editingUser.agency_id);
			setUserDialogOpen(false);
			setEditingUser(null);
			userForm.reset();
		} catch (error) {
			toast.error('failed to update user');
		}
	};

	// Dialog handlers
	const openAgencyDialog = (agency?: Agency) => {
		if (agency) {
			setEditingAgency(agency);
			agencyForm.reset({
				name: agency.name,
				slug: agency.slug,
			});
		} else {
			setEditingAgency(null);
			agencyForm.reset();
		}
		setAgencyDialogOpen(true);
	};

	const openUserDialog = (agencyId: number, user?: User) => {
		setSelectedAgencyId(agencyId);
		if (user) {
			setEditingUser(user);
			userForm.reset({
				name: user.name,
				email: user.email,
				role: user.role,
				password: "",
			});
		} else {
			setEditingUser(null);
			userForm.reset({
				name: '',
				email: '',
				role: '',
				password: '',
			});
		}
		setUserDialogOpen(true);
	};

	useEffect(() => {
		loadAgencies();
	}, []);

  	const handleLogout = () => {
		// Implement your logout logic here
		localStorage.removeItem("zikasha_crm_token");
		localStorage.removeItem("zikasha_crm_refresh_token");
		localStorage.removeItem("user");
		window.location.href = "/superadmin/login"; // Redirect to login page
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}
  
  return (
	<>
		<header className="border-b bg-orange-50">
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-between">
					<div>
						<img className="max-h-[40px]" src={ZCRMLogo} alt="Zikasha CRM" />
						<span className="text-xs text-amber-700">Super Admin Dashboard</span>
					</div>
					<div className="right">
						<Button
							className="border-red-600 text-red-600 hover:text-red-700 hover:bg-red-50"
							variant="outline"
							onClick={handleLogout}
						>
							<LogOut />
							Logout
						</Button>
					</div>
				</div>
			</div>
		</header>
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-xl md:text-2xl font-bold">Agencies</h1>
				<Button onClick={() => openAgencyDialog()}>
					<Plus className="w-4 h-4 mr-2" />
					Create Agency
				</Button>
			</div>

			<div className="space-y-4">
				{agencies.map((agency) => (
					<Card key={agency.id}>
						<Collapsible
							open={expandedAgencies.has(agency.id)}
							onOpenChange={() => toggleAgency(agency.id)}
						>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CollapsibleTrigger asChild>
										<Button
											variant="outline"
											className="flex items-center space-x-2 p-0"
										>
											{expandedAgencies.has(agency.id) ? (
												<ChevronDown className="w-4 h-4" />
											) : (
												<ChevronRight className="w-4 h-4" />
											)}
											<Building className="w-5 h-5" />
											<div className="text-left">
												<CardTitle className="text-lg">{agency.name}</CardTitle>
											</div>
										</Button>
									</CollapsibleTrigger>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => openUserDialog(agency.id)}
										>
											<Plus className="w-4 h-4 mr-1" />
											Add User
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openAgencyDialog(agency)}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteAgency(agency)}
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</CardHeader>

							<CollapsibleContent className="mt-3">
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center space-x-2 text-sm font-medium">
											<Users className="w-4 h-4" />
											<span>Users ({agency.Users?.length || 0})</span>
										</div>

										{agency.Users && agency.Users.length > 0 ? (
											<div className="space-y-2">
												{agency.Users.map((user) => (
													<div
														key={user.id}
														className="flex items-center justify-between p-3 border rounded-lg"
													>
														<div>
															<p className="font-medium">{user.name}</p>
															<p className="text-sm text-muted-foreground">
																{user.email} • {user.role}
															</p>
														</div>
														<div className="flex items-center space-x-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => openUserDialog(agency.id, user)}
															>
																<Edit className="w-3 h-3" />
															</Button>
														</div>
													</div>
												))}
											</div>
										) : (
											<p className="text-sm text-muted-foreground py-4">
												No users found for this agency.
											</p>
										)}
									</div>
								</CardContent>
							</CollapsibleContent>
						</Collapsible>
					</Card>
				))}
			</div>

			{/* Agency Dialog */}
			<Dialog open={agencyDialogOpen} onOpenChange={setAgencyDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingAgency ? "Update Agency" : "Create Agency"}
						</DialogTitle>
						<DialogDescription>
							{editingAgency
								? "Update the agency information below."
								: "Fill in the details to create a new agency."}
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={agencyForm.handleSubmit(
							editingAgency ? handleUpdateAgency : handleCreateAgency
						)}
						className="space-y-4"
					>
						<div>
							<Label className="mb-2" htmlFor="name">Name</Label>
							<Input
								id="name"
								{...agencyForm.register("name")}
								placeholder="Agency name"
							/>
							{
								agencyForm.formState.errors.name &&
								<p className="text-sm text-destructive mt-1">
									{agencyForm.formState.errors.name.message}
								</p>
							}
						</div>
						<div>
							<Label className="mb-2" htmlFor="slug">Slug</Label>
							<Input
								id="slug"
								{...agencyForm.register("slug")}
								placeholder="agency-slug"
							/>
							{
								agencyForm.formState.errors.slug &&
								<p className="text-sm text-destructive mt-1">
									{agencyForm.formState.errors.slug.message}
								</p>
							}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setAgencyDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">
								{editingAgency ? "Update" : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* User Dialog */}
			<Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingUser ? "Update User" : "Create User"}
						</DialogTitle>
						<DialogDescription>
							{editingUser
								? "Update the user information below."
								: "Fill in the details to create a new user."}
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={userForm.handleSubmit(
							editingUser ? handleUpdateUser : handleCreateUser
						)}
						className="space-y-4"
					>
						<div>
							<Label className="mb-2" htmlFor="userName">Name</Label>
							<Input
								id="userName"
								{...userForm.register("name")}
								placeholder="User name"
							/>
							{userForm.formState.errors.name && (
								<p className="text-sm text-destructive mt-1">
									{userForm.formState.errors.name.message}
								</p>
							)}
						</div>
						<div>
							<Label className="mb-2" htmlFor="userEmail">Email</Label>
							<Input
								id="userEmail"
								type="email"
								{...userForm.register("email")}
								placeholder="user@example.com"
							/>
							{
								userForm.formState.errors.email &&
								<p className="text-sm text-destructive mt-1">
									{userForm.formState.errors.email.message}
								</p>
							}
						</div>
						{
							!editingUser &&
							<div>
								<Label className="mb-2" htmlFor="userPassword">Password</Label>
								<Input
									id="userPassword"
									type="password"
									{...userForm.register("password")}
									placeholder="Password (optional, default will be used)"
								/>
								{
									userForm.formState.errors.password &&
									<p className="text-sm text-destructive mt-1">
										{userForm.formState.errors.password.message}
									</p>
								}
							</div>
						}
						<div>
							<Label className="mb-2" htmlFor="userRole">Role</Label>
							<Input
								id="userRole"
								{...userForm.register("role")}
								placeholder="user, admin"
							/>
							{
								userForm.formState.errors.role && 
								<p className="text-sm text-destructive mt-1">
									{userForm.formState.errors.role.message}
								</p>
							}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setUserDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">{editingUser ? "Update" : "Create"}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	</>
  );
}

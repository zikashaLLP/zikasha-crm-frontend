// components/layout/app-layout.tsx
import Sidebar from "@/components/layout/sidebar";
import { Outlet } from "react-router-dom";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";
import { LogOut } from "lucide-react";

export default function AppLayout() {
	const { collapsed } = useSidebar();

	const { user } = useContext(AuthContext);

	const handleLogout = () => {
		// Implement your logout logic here
		localStorage.removeItem("zikasha_crm_token");
		localStorage.removeItem("zikasha_crm_refresh_token");
		localStorage.removeItem("user");
		window.location.href = "/login"; // Redirect to login page
	};

	const userShortName = (name: string) => {
		const names = name.split(" ");
		if (names.length === 1) {
			return names[0].charAt(0).toUpperCase();
		} else if (names.length > 1) {
			return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
		}
		return "";
	}

	return (
		<div
			className={`min-h-screen relative transition-all duration-200 ${collapsed ? "md:pl-16" : "md:pl-64"
				}`}
		>
			<Sidebar />

			<header
				className="bg-white shadow sticky top-0 right-0 z-10 h-[60px]"
			>
				<div className="flex h-full justify-end items-center px-4 md:px-6">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="bg-blue-200 hover:bg-blue-300 rounded-full"
							>{userShortName(user.name)}</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>
								<div className="flex gap-2">
									{
										userShortName(user.name) &&
										<div className="rounded-full w-10 h-10 flex justify-center items-center border bg-gray-100">
											{userShortName(user.name)}
										</div>
									}
									<div className="flex-1">
										{user.name}<br/>
										<span className="text-xs text-gray-500">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="text-red-700 w-4 h-4" />
								<span className="text-red-700">Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
			<main className="pt-6 px-4 md:px-6 max-w-6xl mx-auto">
				<Outlet />
			</main>
		</div>
	);
}

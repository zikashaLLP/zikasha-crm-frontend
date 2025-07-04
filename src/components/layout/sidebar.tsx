import {
	LayoutDashboard,
	Settings,
	LogOut,
	Menu,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSidebar } from "@/contexts/sidebar-context";

const navItems = [
	{
		title: "Inquiries",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Settings",
		href: "/dashboard/settings",
		icon: Settings,
	},
];

export default function Sidebar() {
	const location = useLocation();
	const [open, setOpen] = useState(false); // for mobile sidebar sheet
	const { collapsed, setCollapsed } = useSidebar();
	const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

	const handleLogout = () => {
		// Implement your logout logic here
		localStorage.removeItem("token");
		window.location.href = "/login"; // Redirect to login page
	};

	// Listen for screen resize to update isDesktop
	useEffect(() => {
		const handleResize = () => {
			setIsDesktop(window.innerWidth >= 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const NavLinks = ({ collapsed }: { collapsed: boolean }) => (
		<nav className="space-y-1">
			{navItems.map(({ title, href, icon: Icon }) => {
				const isActive = location.pathname === href;
				return (
					<Link
						key={href}
						to={href}
						onClick={() => setOpen(false)} // closes sheet on mobile
						className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${isActive ? "bg-blue-100 text-primary" : "hover:bg-muted"
							}`}
					>
						<Icon className="h-4 w-4" />
						{!collapsed && <span className="text-primary">{title}</span>}
					</Link>
				);
			})}
			<Button
				variant="ghost"
				className="w-full justify-start p-3 hover:bg-red-50 hover:text-red-500"
				onClick={handleLogout}
			>
				<LogOut className="h-4 w-4 mr-2" />
				{!collapsed && <span>Logout</span>}
			</Button>
		</nav>
	);

	return (
		<>
			{/* Mobile Sidebar */}
			{!isDesktop && (
				<div className="md:hidden z-50">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="fixed top-4 left-4 z-50"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-[240px] px-2 py-4">
							<div>
								<h2 className="px-3 py-2 text-xl font-medium mb-2">Zikasha</h2>
								<NavLinks collapsed={false} /> {/* Always show full on mobile */}
							</div>
						</SheetContent>
					</Sheet>
				</div>
			)}

			{/* Desktop Sidebar */}
			{isDesktop && (
				<aside
					className={`fixed inset-y-0 left-0 border-r bg-background px-2 py-4 hidden md:flex flex-col transition-all duration-200 z-50 ${collapsed ? "w-16" : "w-64"
						}`}
				>
					<div className="relative">
						<div className="absolute -top-0 -right-12 z-50">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setCollapsed(!collapsed)}
							>
								{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
							</Button>
						</div>

						<h2 className="px-3 py-2 text-xl font-medium mb-2">{collapsed ? 'Z' : 'Zikasha'}</h2>
						<NavLinks collapsed={collapsed} />
					</div>
				</aside>
			)}
		</>
	);
}

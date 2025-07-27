import {
	LayoutDashboard,
	Settings,
	LogOut,
	Menu,
	ChevronLeft,
	ChevronRight,
	Users,
	BookUser,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useSidebar } from "@/contexts/sidebar-context";

import ZikashaCRM from "../../assets/zikasha-crm-logo.svg";
import ZikashaCRMIcon from "../../assets/zikasha-crm-icon.svg";
import { AuthContext } from "@/contexts/AuthContext";

const navItems = [
	{
		title: "Inquiries",
		href: "/dashboard",
		icon: LayoutDashboard,
		view: ['admin', 'staff']
	},
	{
		title: "Customers",
		href: "/dashboard/customers",
		icon: Users,
		view: ['admin', 'staff']
	},
	{
		title: "Staff",
		href: "/dashboard/staff",
		icon: BookUser,
		view: ['admin']
	},
	{
		title: "Settings",
		href: "/dashboard/settings",
		icon: Settings,
		view: ['admin']
	},
];

export default function Sidebar() {
	const location = useLocation();
	const [open, setOpen] = useState(false); // for mobile sidebar sheet
	const { collapsed, setCollapsed } = useSidebar();
	const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

	const { user } = useContext(AuthContext);

	const handleLogout = () => {
		// Implement your logout logic here
		localStorage.removeItem("zikasha_crm_token");
		localStorage.removeItem("zikasha_crm_refresh_token");
		localStorage.removeItem("user");
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
			{navItems.map(({ title, href, icon: Icon, view }) => {
				const isActive = location.pathname === href;
				if ( ! view.includes(user.role) ) return null;
				return (
					<Link
						key={href}
						to={href}
						onClick={() => setOpen(false)} // closes sheet on mobile
						className={`flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors ${isActive ? "bg-blue-100 text-primary" : "hover:bg-muted"}`}
					>
						<Icon className="h-4 w-4" />
						{!collapsed && <span className="text-primary ml-3">{title}</span>}
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
								<div className="">
									<img
										className="h-[36px] pb-4 pt-2 px-1 box-content"
										src={ ZikashaCRM } 
										alt="Zikasha CRM Logo"
									/>
								</div>
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

						<div>
							{
								collapsed ? (
									<img
										className="h-[36px] box-content pb-4 px-2"
										src={ ZikashaCRMIcon }
										alt="Zikasha CRM Icon"
									/>
								) : (
									<img
										className="h-[48px] pb-4"
										src={ ZikashaCRM }
										alt="Zikasha CRM Logo"
									/>
								)
							}
						</div>
						<NavLinks collapsed={collapsed} />
					</div>
				</aside>
			)}
		</>
	);
}

import {
	LayoutDashboard,
	Settings,
	Menu,
	PanelLeft,
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
import { AuthContext } from "@/contexts/AuthContext";

import RealEstateCRMLogo from "../../assets/logos/real-estate-zcrm.svg";
import RealEstateIcon from "../../assets/logos/real-estate-icon.svg";
import OfficeCRMLogo from "../../assets/logos/office-zcrm.svg";
import OfficeIcon from "../../assets/logos/office-icon.svg";
import DoctorCRMLogo from "../../assets/logos/doctor-zcrm.svg";
import DoctoIcon from "../../assets/logos/doctor-icon.svg";

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

const logos = [
	{
		type: 'real-estate',
		logo: RealEstateCRMLogo,
		icon: RealEstateIcon,
	},
	{
		type: 'office',
		logo: OfficeCRMLogo,
		icon: OfficeIcon,
	},
	{
		type: 'doctor',
		logo: DoctorCRMLogo,
		icon: DoctoIcon,
	}
];

export default function Sidebar() {
	const location = useLocation();
	const [open, setOpen] = useState(false); // for mobile sidebar sheet
	const { collapsed, setCollapsed } = useSidebar();
	const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

	const { user } = useContext(AuthContext);

	const logo = logos.find((logo) => logo.type === user?.agency?.crm_type) || logos[0];

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
								id="mobile-menu-toggle"
								className="fixed top-3 right-15 z-50 hidden"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[240px] px-2 py-4">
							<div>
								<div className="mb-6"></div>
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
								variant="ghost"
								size="icon"
								onClick={() => setCollapsed(!collapsed)}
							>
								<PanelLeft />
							</Button>
						</div>

						<div>
							<Link to="/dashboard">
							{
								collapsed ? (
									<img
										className="h-[36px] box-content pb-4 px-2"
										src={ logo.icon }
										alt="Zikasha CRM Icon"
									/>
								) : (
									<img
										className="h-[60px] pb-4"
										src={ logo.logo }
										alt="Zikasha CRM Logo"
									/>
								)
							}
							</Link>
						</div>
						<NavLinks collapsed={collapsed} />
					</div>
				</aside>
			)}
		</>
	);
}

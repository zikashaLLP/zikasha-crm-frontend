// components/layout/app-layout.tsx
import Sidebar from "@/components/layout/sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext, useState, useEffect } from "react";
import { LogOut, User, Menu, Users, BookUser, SettingsIcon, LucideLayoutDashboard, ListTodoIcon, PlusCircleIcon, UsersIcon } from "lucide-react";


import RealEstateCRMLogo from "../../assets/logos/real-estate-zcrm.svg";
import RealEstateIcon from "../../assets/logos/real-estate-icon.svg";
import OfficeCRMLogo from "../../assets/logos/office-zcrm.svg";
import OfficeIcon from "../../assets/logos/office-icon.svg";
import DoctorCRMLogo from "../../assets/logos/doctor-zcrm.svg";
import DoctoIcon from "../../assets/logos/doctor-icon.svg";

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

export default function AppLayout() {
    const { collapsed } = useSidebar();
    const { user } = useContext(AuthContext);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
	const location = useLocation();

	const logo = logos.find((logo) => logo.type === user?.agency?.crm_type) || logos[0];

    useEffect(() => {
        const handleScroll = () => {
            // Only run this code for mobile devices
            if (window.innerWidth <= 768) {
                const currentScrollY = window.scrollY;
                
                if (Math.abs(currentScrollY - lastScrollY) >= 80) {
                    setIsHeaderVisible(currentScrollY < lastScrollY);
                    setLastScrollY(currentScrollY);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

	const checkIOSDevice = () => {
		return /iPad|iPhone|iPod/.test(navigator.userAgent);
	};

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

	const isActivePath = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div
            className={`min-h-screen relative transition-all duration-200 ${collapsed ? "md:pl-16" : "md:pl-64"
                }`}
        >
            <Sidebar />

            <header
                className={`bg-white h-[60px] z-10 shadow fixed top-0 right-0 left-0 transition-transform duration-300 ${
                    collapsed ? "md:left-16" : "md:left-64"
                } ${
                    !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
                }`}
            >
                <div className="flex h-full justify-between items-center px-4 md:px-6">
					<div>
						<Link to="/dashboard" className="md:hidden">
							<img src={ logo.logo } className="fixed top-3 left-4 z-50 h-[40px]" />
						</Link>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="md:hidden"
							onClick={() => {
								const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
								if (mobileMenuToggle) {
									mobileMenuToggle.click();
								}
							}}
						>
							<Menu className="h-5 w-5" />
						</Button>
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
								<DropdownMenuItem asChild>
									<Link to="/dashboard/profile" className="flex items-center w-full">
										<User className="w-4 h-4 mr-2" />
										<span>Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleLogout}>
									<LogOut className="text-red-700 w-4 h-4" />
									<span className="text-red-700">Logout</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
            </header>
            <main className="md:bg-[#f2f3f6] min-h-screen py-[60px]">
                <div className="pt-6 px-4 md:px-6 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>

			<footer className={`md:hidden bg-white z-10 shadow fixed bottom-0 right-0 left-0 transition-transform duration-300 md:left-64 flex items-center border-t px-6 pt-2 ${checkIOSDevice() ? 'pb-10' : 'pb-8'}`}>
				<div className="flex justify-between items-center gap-6 max-w-lg w-full mx-auto">
					<Link 
						to="/dashboard" 
						className={`flex justify-center items-center w-7 h-7 rounded ${isActivePath('/dashboard') ? 'text-white bg-primary' : 'text-gray-500'}`}
					>
						<LucideLayoutDashboard className="h-5 w-5" />
					</Link>
					
					<Link 
						to="/dashboard/inquiries"
						className={`flex justify-center items-center w-7 h-7 rounded ${isActivePath('/dashboard/inquiries') ? 'text-white bg-primary' : 'text-gray-500'}`}
					>
						<ListTodoIcon className="h-5 w-5" />
					</Link>
					
					<Link 
						to="/dashboard/inquiries/new"
						className={`flex justify-center items-center w-7 h-7 rounded ${location.pathname === '/dashboard/inquiries/new' ? 'text-white bg-primary' : 'text-gray-500'}`}
					>
						<PlusCircleIcon className="h-5 w-5" />
					</Link>

					<Link 
						to="/dashboard/customers"
						className={`flex justify-center items-center w-7 h-7 rounded ${isActivePath('/dashboard/customers') || isActivePath('/dashboard/staff') ? 'text-white bg-primary' : 'text-gray-500'}`}
					>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<UsersIcon className="h-5 w-5" />
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-screen" align="end">
								<DropdownMenuItem asChild>
									<Link 
										to="/dashboard/customers" 
										className={`flex items-center w-full p-2 ${isActivePath('/dashboard/customers') ? 'font-semibold' : ''}`}
									>
										<Users className="w-4 h-4 mr-2" />
										<span>Customers</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link 
										to="/dashboard/staff" 
										className={`flex items-center w-full ${isActivePath('/dashboard/staff') ? 'font-semibold' : ''}`}
									>
										<BookUser className="w-4 h-4 mr-2" />
										<span>Staff</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</Link>
					
					<Link 
						to="/dashboard/settings"
						className={`flex justify-center items-center w-7 h-7 rounded ${isActivePath('/dashboard/settings') ? 'text-white bg-primary' : 'text-gray-500'}`}
					>
						<SettingsIcon className="h-5 w-5" />
					</Link>
				</div>
			</footer>
        </div>
    );
}
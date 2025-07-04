// components/layout/app-layout.tsx
import Sidebar from "@/components/layout/sidebar";
import { Outlet } from "react-router-dom";
import { useSidebar } from "@/contexts/sidebar-context";

export default function AppLayout() {
	const { collapsed } = useSidebar();

	return (
		<div
			className={`min-h-screen relative transition-all duration-200 ${collapsed ? "md:pl-16" : "md:pl-64"
				}`}
		>
			<Sidebar />

			<header
				className="bg-white shadow sticky top-0 right-0 z-10 h-[60px]"
			>
			</header>
			<main className="pt-6 px-4 md:px-6 max-w-6xl mx-auto">
				<Outlet />
			</main>
		</div>
	);
}

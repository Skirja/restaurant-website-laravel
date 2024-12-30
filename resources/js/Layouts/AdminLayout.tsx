import { useState, type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Menu,
    Store,
    ShoppingCart,
    CalendarDays,
    MessageSquare,
    Tag,
    Users,
    BarChart
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
}

const sidebarNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Menu Management",
        href: "/admin/menu",
        icon: Store,
    },
    {
        title: "Order Management",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Reservation Management",
        href: "/admin/reservations",
        icon: CalendarDays,
    },
    {
        title: "Review Management",
        href: "/admin/reviews",
        icon: MessageSquare,
    },
    {
        title: "Discount Management",
        href: "/admin/discounts",
        icon: Tag,
    },
    {
        title: "Employee Management",
        href: "/admin/employees",
        icon: Users,
    },
    {
        title: "Sales Report",
        href: "/admin/reports",
        icon: BarChart,
    },
];

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { url } = usePage();

    return (
        <div className="flex min-h-screen bg-amber-50/30">
            {/* Sidebar for desktop */}
            <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 border-r bg-amber-800 shadow-lg">
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-amber-100">Admin Panel</h2>
                    </div>
                    <ScrollArea className="flex-1 overflow-y-auto">
                        <nav className="grid gap-1 p-4">
                            {sidebarNavItems.map((item, index) => {
                                const isActive = url.startsWith(item.href);
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
                                            "hover:bg-amber-700 hover:text-amber-100",
                                            "active:bg-amber-900",
                                            isActive
                                                ? "bg-amber-900/80 text-amber-100 font-medium"
                                                : "text-amber-200"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-4 w-4",
                                            isActive ? "text-amber-100" : "text-amber-300"
                                        )} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                </div>
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" className="px-2 py-2">
                        <Menu className="h-6 w-6 text-amber-800" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-amber-800 border-r-amber-700">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-amber-100">Admin Panel</h2>
                    </div>
                    <ScrollArea className="h-[calc(100vh-5rem)]">
                        <nav className="grid gap-1 p-4">
                            {sidebarNavItems.map((item, index) => {
                                const isActive = url.startsWith(item.href);
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
                                            "hover:bg-amber-700 hover:text-amber-100",
                                            "active:bg-amber-900",
                                            isActive
                                                ? "bg-amber-900/80 text-amber-100 font-medium"
                                                : "text-amber-200"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-4 w-4",
                                            isActive ? "text-amber-100" : "text-amber-300"
                                        )} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Main content */}
            <main className="flex-1 md:ml-64 overflow-y-auto">
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
} 
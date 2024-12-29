import { useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
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

    return (
        <div className="flex min-h-screen">
            {/* Sidebar for desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-gray-100/40 dark:bg-gray-800/40">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                </div>
                <ScrollArea className="flex-1">
                    <nav className="grid gap-1 p-4">
                        {sidebarNavItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                                    "focus:bg-gray-100 dark:focus:bg-gray-800"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </ScrollArea>
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" className="px-2 py-2">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold">Admin Panel</h2>
                    </div>
                    <ScrollArea className="h-[calc(100vh-5rem)]">
                        <nav className="grid gap-1 p-4">
                            {sidebarNavItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                                        "focus:bg-gray-100 dark:focus:bg-gray-800"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
} 
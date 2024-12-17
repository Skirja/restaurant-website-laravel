import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import {
    Home,
    List,
    User,
    ChevronDown,
    Utensils,
    ShoppingBag,
    Truck
} from "lucide-react";
import { useEffect, useState } from 'react';

interface OrderMethod {
    title: string;
    icon: React.ReactNode;
    link: string;
    description: string;
}

interface Testimonial {
    name: string;
    text: string;
}

export default function Welcome({ auth }: PageProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const orderMethods: OrderMethod[] = [
        {
            title: "Dine-in",
            icon: <Utensils className="w-16 h-16 text-amber-600" />,
            link: "/booking-dinein",
            description: "Pesan makanan dengan metode dine-in"
        },
        {
            title: "Takeaway",
            icon: <ShoppingBag className="w-16 h-16 text-amber-600" />,
            link: "/menu",
            description: "Pesan makanan dengan metode takeaway"
        },
        {
            title: "Delivery",
            icon: <Truck className="w-16 h-16 text-amber-600" />,
            link: "/menu",
            description: "Pesan makanan dengan metode delivery"
        }
    ];

    const testimonials: Testimonial[] = [
        {
            name: "Budi Santoso",
            text: "Rendangnya luar biasa lezat! Rasa rempahnya kuat dan dagingnya empuk."
        },
        {
            name: "Siti Rahma",
            text: "Pelayanannya ramah dan cepat. Suasana restorannya juga nyaman dan bersih."
        },
        {
            name: "Agus Purnomo",
            text: "Harga terjangkau untuk kualitas makanan yang sangat baik. Pasti akan kembali lagi!"
        }
    ];

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <>
            <Head title="RM Padang Sejati" />
            <div className="flex flex-col min-h-screen bg-amber-50">
                {/* Navbar */}
                <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-amber-800 shadow-lg' : 'bg-transparent'}`}>
                    <div className="container mx-auto flex justify-between items-center p-4">
                        <h1 className="text-3xl font-bold text-amber-100">
                            RM PADANG SEJATI
                        </h1>
                        <ul className="hidden md:flex space-x-6">
                            <li>
                                <a href="/" className="text-amber-100 hover:text-amber-300 transition-colors duration-300">
                                    Beranda
                                </a>
                            </li>
                            <li>
                                <a href="/menu" className="text-amber-100 hover:text-amber-300 transition-colors duration-300">
                                    Daftar Menu
                                </a>
                            </li>
                            <li>
                                <a href="/login" className="text-amber-100 hover:text-amber-300 transition-colors duration-300">
                                    Masuk/Daftar
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-amber-800 text-amber-100 z-50">
                    <ul className="flex justify-around py-2">
                        <li className="flex flex-col items-center">
                            <Home className="w-6 h-6 mb-1" />
                            <a href="/" className="text-xs">Beranda</a>
                        </li>
                        <li className="flex flex-col items-center">
                            <List className="w-6 h-6 mb-1" />
                            <a href="/menu" className="text-xs">Daftar Menu</a>
                        </li>
                        <li className="flex flex-col items-center">
                            <User className="w-6 h-6 mb-1" />
                            <a href="/login" className="text-xs">Akun</a>
                        </li>
                    </ul>
                </nav>

                {/* Hero Section */}
                <div className="relative h-screen">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url(/assets/Banner.png)"
                        }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
                        <h2 className="text-5xl font-bold mb-4">
                            Nikmati Kelezatan Masakan Padang
                        </h2>
                        <p className="text-xl mb-8">
                            Rasakan cita rasa autentik dalam setiap suapan
                        </p>
                        <a
                            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg text-lg"
                            href="#order-methods"
                            onClick={(e) => handleScroll(e, 'order-methods')}
                        >
                            Pesan Sekarang
                        </a>
                    </div>
                </div>
                <div id="scroll-indicator">
                    <ChevronDown className="text-white" />
                </div>

                {/* Metode Pemesanan */}
                <section className="container mx-auto my-16">
                    <h2 className="text-3xl font-bold text-center mb-12 text-amber-800">
                        Pilih Cara Pesan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="order-methods">
                        {orderMethods.map((method, index) => (
                            <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    {method.icon}
                                    <h3 className="text-xl font-semibold mb-2 text-amber-800 mt-4">
                                        {method.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{method.description}</p>
                                    <Button
                                        variant="outline"
                                        className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                                        asChild
                                    >
                                        <a href={method.link}>Pilih</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Testimoni */}
                <section className="py-16 bg-amber-100">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-amber-800">
                            Apa Kata Mereka?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <Card key={index} className="bg-white">
                                    <CardContent className="p-6">
                                        <p className="mb-4 text-gray-600 italic">"{testimonial.text}"</p>
                                        <p className="font-semibold text-amber-800">- {testimonial.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-amber-800 text-amber-100 py-12">
                    <div className="container mx-auto text-center">
                        <h2 className="text-2xl font-bold mb-4">RM Padang Sejati</h2>
                        <p className="mb-4">Jl. Merdeka No. 123, Jakarta Pusat</p>
                        <div className="flex justify-center space-x-4 mb-8">
                            <a href="#" className="hover:text-amber-300 transition-colors duration-300">
                                Facebook
                            </a>
                            <a href="#" className="hover:text-amber-300 transition-colors duration-300">
                                Instagram
                            </a>
                            <a href="#" className="hover:text-amber-300 transition-colors duration-300">
                                Twitter
                            </a>
                        </div>
                        <p>&copy; 2024 RM Padang Sejati. Hak Cipta Dilindungi.</p>
                        <div className="mt-4">
                            <a href="#" className="hover:text-amber-300 transition-colors duration-300 mx-2">
                                Tentang Kami
                            </a>
                            <a href="#" className="hover:text-amber-300 transition-colors duration-300 mx-2">
                                Kontak
                            </a>
                            <a href="#" className="hover:text-amber-300 transition-colors duration-300 mx-2">
                                Kebijakan Privasi
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

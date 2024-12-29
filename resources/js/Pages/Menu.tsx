import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Home, List, User } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";

interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
}

const menuItems: MenuItem[] = [
    { id: 1, name: 'Rendang', category: 'Daging', price: 45000, image: '/assets/rendang.jpg', description: 'Daging sapi yang dimasak dengan rempah-rempah khas Padang' },
    { id: 2, name: 'Ayam Pop', category: 'Ayam', price: 35000, image: '/assets/ayam-pop.jpg', description: 'Ayam goreng khas Padang dengan tekstur lembut' },
    { id: 3, name: 'Gulai Ikan', category: 'Ikan', price: 40000, image: '/assets/gulai-ikan.jpg', description: 'Ikan dimasak dengan kuah santan dan rempah-rempah' },
    { id: 4, name: 'Ayam Bakar Padang', category: 'Ayam', price: 38000, image: '/assets/ayam-bakar-padang.jpg', description: 'Ayam bakar dengan bumbu khas Padang' },
    { id: 5, name: 'Dendeng Batokok', category: 'Daging', price: 50000, image: '/assets/dendeng-batokok.jpg', description: 'Irisan daging sapi yang dipukul-pukul dan digoreng kering' },
    { id: 6, name: 'Sayur Nangka', category: 'Sayur', price: 25000, image: '/assets/sayur-nangka.jpg', description: 'Nangka muda yang dimasak dengan santan dan rempah' },
    { id: 7, name: 'Kalio', category: 'Daging', price: 48000, image: '/assets/kalio.jpg', description: 'Hidangan daging bersantan mirip rendang dengan warna lebih terang' },
    { id: 8, name: 'Paru Goreng', category: 'Daging', price: 35000, image: '/assets/paru-goreng.jpg', description: 'Irisan paru sapi yang digoreng kering dan renyah' },
    { id: 9, name: 'Perkedel', category: 'Sayur', price: 8000, image: '/assets/perkedel.jpg', description: 'Gorengan kentang dengan daging cincang' },
    { id: 10, name: 'Telur Dadar Padang', category: 'Telur', price: 15000, image: '/assets/telor-dadar-padang.jpg', description: 'Telur dadar tebal khas Padang' },
    { id: 11, name: 'Es Teh', category: 'Minuman', price: 5000, image: '/assets/es-teh.jpg', description: 'Teh manis dingin yang menyegarkan' },
    { id: 12, name: 'Es Jeruk', category: 'Minuman', price: 7000, image: '/assets/es-jeruk.jpg', description: 'Jus jeruk segar dengan es' },
];

const categories = ['Semua', ...new Set(menuItems.map(item => item.category))];

export default function Menu() {
    const [activeCategory, setActiveCategory] = useState('Semua');

    const filteredItems = activeCategory === 'Semua'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    const foodCount = menuItems.filter(item => item.category !== 'Minuman').length;
    const drinkCount = menuItems.filter(item => item.category === 'Minuman').length;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <Head title="Daftar Menu - RM PADANG SEJATI" />

            {/* Navbar */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-amber-800">
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
                            <a href={route('menu')} className="text-amber-100 hover:text-amber-300 transition-colors duration-300">
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
                        <a href={route('menu')} className="text-xs">Daftar Menu</a>
                    </li>
                    <li className="flex flex-col items-center">
                        <User className="w-6 h-6 mb-1" />
                        <a href="/login" className="text-xs">Akun</a>
                    </li>
                </ul>
            </nav>

            {/* Menu Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-amber-800">
                        Menu Kami
                    </h2>

                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                variant={activeCategory === category ? "default" : "outline"}
                                className={`rounded-full ${
                                    activeCategory === category 
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                                        : 'text-amber-600 border-amber-600 hover:bg-amber-100'
                                }`}
                            >
                                {category === 'Semua' ? 'Semua Menu' : category}
                            </Button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="relative h-48">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
                                    />
                                    <span className="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded-full text-sm">
                                        {item.category}
                                    </span>
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-amber-800">{item.name}</h3>
                                    <p className="text-gray-600 mb-4">{item.description}</p>
                                    <div className="flex justify-end items-center">
                                        <span className="text-lg font-bold text-amber-600">
                                            Rp {item.price.toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-semibold mb-6 text-amber-800">
                            Statistik Menu
                        </h3>
                        <div className="flex justify-center items-center space-x-12">
                            <Card className="flex items-center p-4">
                                <i className="fas fa-utensils text-3xl text-amber-600 mr-3"></i>
                                <span className="text-xl font-semibold text-gray-800">
                                    {foodCount} Makanan
                                </span>
                            </Card>
                            <Card className="flex items-center p-4">
                                <i className="fas fa-coffee text-3xl text-amber-600 mr-3"></i>
                                <span className="text-xl font-semibold text-gray-800">
                                    {drinkCount} Minuman
                                </span>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-amber-800 text-amber-100 py-12 mt-auto">
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
    );
} 
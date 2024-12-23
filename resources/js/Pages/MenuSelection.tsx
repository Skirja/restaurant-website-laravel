import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Home, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";

interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

const menuItems: MenuItem[] = [
    { id: 1, name: 'Rendang', category: 'Daging', price: 45000, image: '/assets/rendang.jpg' },
    { id: 2, name: 'Ayam Pop', category: 'Ayam', price: 35000, image: '/assets/ayam-pop.jpg' },
    { id: 3, name: 'Gulai Ikan', category: 'Ikan', price: 40000, image: '/assets/gulai-ikan.jpg' },
    { id: 4, name: 'Ayam Bakar Padang', category: 'Ayam', price: 38000, image: '/assets/ayam-bakar-padang.jpg' },
    { id: 5, name: 'Dendeng Batokok', category: 'Daging', price: 50000, image: '/assets/dendeng-batokok.jpg' },
    { id: 6, name: 'Sayur Nangka', category: 'Sayur', price: 25000, image: '/assets/sayur-nangka.jpg' },
    { id: 7, name: 'Kalio', category: 'Daging', price: 48000, image: '/assets/kalio.jpg' },
    { id: 8, name: 'Paru Goreng', category: 'Daging', price: 35000, image: '/assets/paru-goreng.jpg' },
    { id: 9, name: 'Perkedel', category: 'Sayur', price: 8000, image: '/assets/perkedel.jpg' },
    { id: 10, name: 'Telur Dadar Padang', category: 'Telur', price: 15000, image: '/assets/telor-dadar-padang.jpg' },
    { id: 11, name: 'Es Teh', category: 'Minuman', price: 5000, image: '/assets/es-teh.jpg' },
    { id: 12, name: 'Es Jeruk', category: 'Minuman', price: 7000, image: '/assets/es-jeruk.jpg' },
];

export default function MenuSelection({ orderType = 'takeaway' }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const addToCart = (item: MenuItem) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return currentCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...currentCart, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity === 0) {
            setCart(currentCart => currentCart.filter(item => item.id !== id));
        } else {
            setCart(currentCart =>
                currentCart.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const CartContent = () => (
        <Card className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-amber-800">Keranjang</h2>
            {cart.length === 0 ? (
                <p className="text-gray-500 my-4">
                    Keranjang Anda kosong. Silakan tambahkan item untuk mulai berbelanja.
                </p>
            ) : (
                <>
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center mb-2">
                            <span className="font-medium flex-grow mr-2">{item.name}</span>
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="mx-2 w-6 text-center">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <span className="ml-2 w-20 text-right">
                                    Rp {(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold text-amber-600">
                                Rp {totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <Button
                            className="w-full bg-amber-600 hover:bg-amber-700"
                            disabled={cart.length === 0}
                            asChild
                        >
                            <Link href={orderType === 'takeaway' ? route('takeaway-checkout') : route('delivery-checkout')}>
                                Pesan
                            </Link>
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );

    return (
        <div className="min-h-screen bg-amber-50">
            <Head title="Pilih Menu - RM PADANG SEJATI" />

            <Link
                href="/"
                className="absolute top-4 left-4 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-300 flex items-center"
            >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline-block md:ml-2">Beranda</span>
            </Link>

            <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
                <h1 className="text-3xl font-bold mb-8 text-amber-800 text-center">
                    Pilih Menu
                </h1>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-2/3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuItems.map(item => (
                                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                                        <p className="text-gray-600 mb-4">{item.category}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-amber-600">
                                                Rp {item.price.toLocaleString()}
                                            </span>
                                            <Button
                                                onClick={() => addToCart(item)}
                                                className="bg-amber-600 hover:bg-amber-700"
                                            >
                                                Tambah
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Cart */}
                    <div className={`w-full md:w-1/3 md:sticky md:top-8 md:self-start ${isMobile ? 'hidden' : 'block'}`}>
                        <CartContent />
                    </div>
                </div>
            </div>

            {/* Mobile Cart Button */}
            {isMobile && (
                <div className="fixed bottom-4 right-4 z-40">
                    <Button
                        onClick={() => setIsMobileCartOpen(true)}
                        className="h-16 w-16 rounded-full bg-amber-600 hover:bg-amber-700 relative"
                    >
                        <ShoppingCart className="h-8 w-8" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </div>
            )}

            {/* Mobile Cart Modal */}
            {isMobile && isMobileCartOpen && (
                <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                    <div className="p-4 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={() => setIsMobileCartOpen(false)}
                        >
                            <X className="h-8 w-8" />
                        </Button>
                        <div className="mt-12">
                            <CartContent />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
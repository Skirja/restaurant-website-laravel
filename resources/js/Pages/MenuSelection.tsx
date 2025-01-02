import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Home, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";

interface MenuItem {
    id: string;
    name: string;
    category: {
        id: string;
        name: string;
    };
    price: number;
    image_url: string | null;
    description: string;
    stock_quantity: number;
    is_available: boolean;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface Props {
    menu_items: MenuItem[];
    orderType?: 'takeaway' | 'delivery';
}

export default function MenuSelection({ menu_items = [], orderType = 'takeaway' }: Props) {
    const [cart, setCart] = useState<CartItem[]>(() => {
        // Load initial cart from localStorage
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const addToCart = (item: MenuItem) => {
        if (!item.is_available || item.stock_quantity <= 0) {
            return;
        }

        setCart(currentCart => {
            const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                // Check if adding one more would exceed stock
                if (existingItem.quantity >= item.stock_quantity) {
                    return currentCart;
                }
                return currentCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...currentCart, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        const item = menu_items.find(item => item.id === id);
        if (!item) return;

        if (newQuantity === 0) {
            setCart(currentCart => currentCart.filter(item => item.id !== id));
        } else if (newQuantity <= item.stock_quantity) {
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
                            {menu_items.map(item => (
                                <Card key={item.id} className={`overflow-hidden transition-shadow duration-300 ${!item.is_available || item.stock_quantity <= 0
                                    ? 'opacity-60'
                                    : 'hover:shadow-lg'
                                    }`}>
                                    {item.image_url ? (
                                        <img
                                            src={`/storage/menu-items/${item.image_url.split('/').pop()}`}
                                            alt={item.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">No Image</span>
                                        </div>
                                    )}
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                                        <p className="text-gray-600 mb-2">{item.category.name}</p>
                                        <p className="text-sm text-gray-500 mb-4">{item.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-amber-600">
                                                Rp {item.price.toLocaleString()}
                                            </span>
                                            <Button
                                                onClick={() => addToCart(item)}
                                                className="bg-amber-600 hover:bg-amber-700"
                                                disabled={!item.is_available || item.stock_quantity <= 0}
                                            >
                                                {!item.is_available ? 'Tidak Tersedia' :
                                                    item.stock_quantity <= 0 ? 'Stok Habis' : 'Tambah'}
                                            </Button>
                                        </div>
                                        {item.stock_quantity > 0 && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Stok: {item.stock_quantity}
                                            </p>
                                        )}
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
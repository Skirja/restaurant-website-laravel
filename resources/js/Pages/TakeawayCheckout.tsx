import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Mail, Phone, ShoppingBag, User, CheckCircle2 } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Calendar as CalendarComponent } from "@/Components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from 'date-fns/locale';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import axios from 'axios';

declare global {
    interface Window {
        snap: {
            pay: (token: string, options: {
                onSuccess: (result: any) => void;
                onPending: (result: any) => void;
                onError: (result: any) => void;
                onClose: () => void;
                language?: string;
            }) => void;
        };
    }
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    [key: string]: string | number;
}

interface Props {
    clientKey: string;
    flash: {
        snap_token?: string;
        error?: string;
        success?: boolean;
        message?: string;
    };
    auth: {
        user: {
            name: string;
            email: string;
        } | null;
    };
}

interface FormData {
    name: string;
    phone: string;
    email: string;
    pickupTime: string;
    pickupDate?: Date;
    notes: string;
    discountCode: string;
}

export default function TakeawayCheckout({ clientKey, flash, auth }: Props) {
    const { toast } = useToast();
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSnapLoaded, setIsSnapLoaded] = useState(false);
    const [isLoadingMidtrans, setIsLoadingMidtrans] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: auth?.user?.name || '',
        phone: '',
        email: auth?.user?.email || '',
        pickupTime: '',
        pickupDate: undefined,
        notes: '',
        discountCode: ''
    });
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [discount, setDiscount] = useState<{ value: number, type: string } | null>(null);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Calculate total
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Load Midtrans script
    useEffect(() => {
        let scriptElement: HTMLScriptElement | null = null;

        const loadMidtransScript = () => {
            setIsLoadingMidtrans(true);

            // Remove existing script if any
            const existingScript = document.querySelector('script[src*="snap.js"]');
            if (existingScript) {
                document.head.removeChild(existingScript);
            }

            // Create new script element
            scriptElement = document.createElement('script');
            scriptElement.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js';
            scriptElement.setAttribute('data-client-key', clientKey);
            scriptElement.async = true;

            // Add event listeners
            scriptElement.onload = () => {
                setIsSnapLoaded(true);
                setIsLoadingMidtrans(false);
            };

            scriptElement.onerror = (error) => {
                setIsSnapLoaded(false);
                setIsLoadingMidtrans(false);
                alert('Gagal memuat sistem pembayaran. Silakan muat ulang halaman.');
            };

            // Append script to document
            document.head.appendChild(scriptElement);
        };

        loadMidtransScript();

        // Cleanup function
        return () => {
            if (scriptElement && document.head.contains(scriptElement)) {
                document.head.removeChild(scriptElement);
            }
        };
    }, [clientKey]);

    // Show error or success message from flash if exists
    useEffect(() => {
        if (flash?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: flash.error,
            });
        }
        if (flash?.success) {
            toast({
                title: "Success",
                description: flash.success,
            });
        }
        if (flash?.message) {
            alert(flash.message);
        }
    }, [flash]);

    // Process snap token if available
    useEffect(() => {
        if (flash?.snap_token && isSnapLoaded && !isProcessingPayment) {
            setIsProcessingPayment(true);
            window.snap.pay(flash.snap_token, {
                onSuccess: function (result) {
                    console.log('Payment success:', result);
                    localStorage.removeItem('cart');
                    router.post(route('takeaway.finish'), {
                        order_id: result.order_id,
                        transaction_status: result.transaction_status,
                        transaction_id: result.transaction_id,
                        payment_type: result.payment_type,
                    }, {
                        onSuccess: () => {
                            setShowConfirmation(true);
                        }
                    });
                },
                onPending: function (result) {
                    alert('Pembayaran pending, silakan selesaikan pembayaran Anda');
                    setIsProcessingPayment(false);
                },
                onError: function (result) {
                    router.get(route('takeaway.error'));
                    alert('Pembayaran gagal, silakan coba lagi');
                    setIsProcessingPayment(false);
                },
                onClose: function () {
                    if (!showConfirmation) {
                        router.get(route('takeaway.cancel'));
                        alert('Anda menutup popup pembayaran sebelum menyelesaikan pembayaran');
                    }
                    setIsProcessingPayment(false);
                },
                language: 'id'
            });
        }
    }, [flash?.snap_token, isSnapLoaded]);

    // Generate time slots from 10:00 to 21:00
    const timeSlots = Array.from({ length: 23 }, (_, i) => {
        const hour = Math.floor(i / 2) + 10;
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert('Keranjang belanja kosong');
            return;
        }

        if (!isSnapLoaded) {
            alert('Sistem pembayaran belum siap. Mohon tunggu sebentar.');
            return;
        }

        if (isProcessingPayment) {
            alert('Pembayaran sedang diproses. Mohon tunggu.');
            return;
        }

        if (!formData.pickupDate) {
            alert('Tanggal pengambilan harus diisi');
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedDate = format(formData.pickupDate, 'yyyy-MM-dd');
            const finalTotal = discount
                ? totalAmount - (discount.type === 'percentage'
                    ? (totalAmount * (discount.value / 100))
                    : discount.value)
                : totalAmount;

            router.post(route('takeaway.checkout'), {
                ...formData,
                pickupDate: formattedDate,
                cart: JSON.stringify(cart),
                discount_code: formData.discountCode,
                total_amount: finalTotal,
            }, {
                preserveScroll: true,
                onError: (errors: any) => {
                    alert('Terjadi kesalahan saat memproses permintaan.');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center p-4">
            <Head title="Checkout Takeaway - RM PADANG SEJATI" />

            <Link
                href="/menu-selection/takeaway"
                className="fixed top-4 left-4 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-300 flex items-center z-10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline-block sm:ml-2">Kembali</span>
            </Link>

            <Card className="w-full max-w-2xl overflow-hidden">
                <div className="bg-amber-600 p-6 text-white text-center relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), repeating-linear-gradient(45deg, #ffffff 25%, #ffffff 25%, #ffffff 75%, transparent 75%, transparent)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 10px 10px'
                        }}
                    ></div>
                    <h1 className="text-3xl font-bold mb-2 relative z-10">
                        Checkout Takeaway
                    </h1>
                    <p className="text-amber-100 relative z-10">
                        Lengkapi informasi untuk pengambilan pesanan Anda
                    </p>
                </div>

                {/* Cart Summary */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-amber-800">Ringkasan Pesanan</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500">Keranjang belanja kosong</p>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity}x @ Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <p className="font-medium">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Masukkan kode diskon"
                                            value={formData.discountCode}
                                            onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (formData.discountCode) {
                                                    axios.post(route('discount.validate'), {
                                                        code: formData.discountCode
                                                    })
                                                        .then(response => {
                                                            if (response.data.success) {
                                                                setDiscount(response.data.discount);
                                                                toast({
                                                                    title: "Sukses",
                                                                    description: "Kode diskon berhasil diterapkan",
                                                                });
                                                            }
                                                        })
                                                        .catch(() => {
                                                            setDiscount(null);
                                                            toast({
                                                                variant: "destructive",
                                                                title: "Error",
                                                                description: "Kode diskon tidak valid",
                                                            });
                                                        });
                                                }
                                            }}
                                            variant="outline"
                                        >
                                            Terapkan
                                        </Button>
                                    </div>
                                    {discount && (
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Diskon</span>
                                            <span>-Rp {(discount.type === 'percentage'
                                                ? (totalAmount * (discount.value / 100))
                                                : discount.value).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center font-bold">
                                        <span>Total</span>
                                        <span>Rp {(discount
                                            ? totalAmount - (discount.type === 'percentage'
                                                ? (totalAmount * (discount.value / 100))
                                                : discount.value)
                                            : totalAmount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nama Lengkap
                        </Label>
                        <Input
                            placeholder="Masukkan nama lengkap Anda"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Nomor Telepon
                        </Label>
                        <Input
                            type="tel"
                            placeholder="Masukkan nomor telepon Anda"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </Label>
                        <Input
                            type="email"
                            placeholder="Masukkan alamat email Anda"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Tanggal Pengambilan
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.pickupDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {formData.pickupDate ? (
                                            format(formData.pickupDate, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                        mode="single"
                                        selected={formData.pickupDate}
                                        onSelect={(date) => setFormData({ ...formData, pickupDate: date })}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Waktu Pengambilan
                            </Label>
                            <Select
                                value={formData.pickupTime}
                                onValueChange={(value) => setFormData({ ...formData, pickupTime: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jam" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || isProcessingPayment || isLoadingMidtrans || !isSnapLoaded || cart.length === 0}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                        {isSubmitting || isProcessingPayment ? 'Memproses...' : `Bayar Rp ${totalAmount.toLocaleString()}`}
                    </Button>
                </form>
            </Card>

            {/* Success Confirmation */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-md w-full p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-amber-800 mb-4">
                            Pembayaran Berhasil!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Terima kasih telah melakukan pemesanan. Pesanan Anda akan segera diproses dan dapat diambil sesuai jadwal.
                        </p>
                        <Button
                            onClick={() => {
                                setShowConfirmation(false);
                                router.visit('/');
                            }}
                            className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                            Kembali ke Beranda
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
} 
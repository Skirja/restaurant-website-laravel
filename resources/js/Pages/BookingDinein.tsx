import { useEffect, useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Book, Calendar as CalendarIcon, Clock, Home, Users, Utensils } from 'lucide-react';
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Button } from "@/Components/ui/button";
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

interface Props {
    clientKey: string;
    flash: {
        snap_token?: string;
        error?: string;
        success?: boolean;
    };
}

interface BookingFormData {
    fullName: string;
    date: Date | undefined;
    time: string;
    guests: number;
    notes: string;
}

export default function BookingDinein({ clientKey, flash }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string; email: string; } | null } };
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [isSnapLoaded, setIsSnapLoaded] = useState(false);
    const [isLoadingMidtrans, setIsLoadingMidtrans] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<BookingFormData>({
        fullName: auth.user?.name || '',
        date: undefined,
        time: '',
        guests: 1,
        notes: ''
    });

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

    // Generate time slots from 10:00 to 21:00
    const timeSlots = Array.from({ length: 23 }, (_, i) => {
        const hour = Math.floor(i / 2) + 10;
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    // Animation effects
    useEffect(() => {
        const rotateElement = (element: HTMLDivElement, duration: number, direction: number = 1) => {
            let rotation = 0;
            setInterval(() => {
                rotation += direction;
                element.style.transform = `rotate(${rotation}deg)`;
            }, duration);
        };

        const utensilsIcon = document.getElementById('utensilsIcon') as HTMLDivElement;
        const bookOpenIcon = document.getElementById('bookOpenIcon') as HTMLDivElement;

        if (utensilsIcon && bookOpenIcon) {
            rotateElement(utensilsIcon, 50);
            rotateElement(bookOpenIcon, 60, -1);
        }
    }, []);

    const checkAvailability = async () => {
        if (!data.date || !data.time || !data.guests) return;

        try {
            const formattedDate = format(data.date, 'yyyy-MM-dd');
            const response = await axios.post(route('reservations.check'), {
                date: formattedDate,
                time: data.time,
                guests: data.guests
            });

            if (!response.data.available) {
                setAvailabilityError(response.data.message || 'Maaf, tidak ada meja yang tersedia untuk waktu yang dipilih.');
                return false;
            }

            setAvailabilityError(null);
            return true;
        } catch (error: any) {
            setAvailabilityError(error.response?.data?.message || 'Terjadi kesalahan saat memeriksa ketersediaan meja.');
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.date) {
            return;
        }

        const isAvailable = await checkAvailability();
        if (!isAvailable) return;

        setShowPaymentDialog(true);
    };

    const handleConfirmBooking = async () => {
        if (!isSnapLoaded) {
            alert('Sistem pembayaran belum siap. Mohon tunggu sebentar.');
            return;
        }

        if (isProcessingPayment) {
            alert('Pembayaran sedang diproses. Mohon tunggu.');
            return;
        }

        if (!data.date) {
            alert('Tanggal harus diisi');
            return;
        }

        try {
            setIsProcessingPayment(true);
            setShowPaymentDialog(false);

            const formattedDate = format(data.date, 'yyyy-MM-dd');

            router.post(route('reservations.store'), {
                fullName: data.fullName,
                date: formattedDate,
                time: data.time,
                guests: data.guests,
                notes: data.notes,
            }, {
                preserveScroll: true,
                onSuccess: (response: any) => {
                    // Check for error in flash data
                    if (response?.props?.flash?.error) {
                        alert(response.props.flash.error);
                        setIsProcessingPayment(false);
                        return;
                    }

                    // Try to get snap token from flash data
                    const snapToken = response?.props?.flash?.snap_token;

                    if (snapToken) {
                        window.snap.pay(snapToken, {
                            onSuccess: function (result) {
                                // Send success notification to backend
                                router.post(route('reservations.finish'), {
                                    transaction_id: result.transaction_id,
                                    order_id: result.order_id,
                                    payment_type: result.payment_type,
                                    transaction_status: result.transaction_status
                                }, {
                                    onSuccess: () => {
                                        setShowConfirmation(true);
                                        reset();
                                        setIsProcessingPayment(false);
                                    },
                                    onError: (errors) => {
                                        alert('Terjadi kesalahan saat memproses konfirmasi pembayaran');
                                        setIsProcessingPayment(false);
                                    }
                                });
                            },
                            onPending: function (result) {
                                alert('Pembayaran pending, silakan selesaikan pembayaran Anda');
                                setIsProcessingPayment(false);
                            },
                            onError: function (result) {
                                router.get(route('reservations.error'));
                                alert('Pembayaran gagal, silakan coba lagi');
                                setIsProcessingPayment(false);
                            },
                            onClose: function () {
                                if (!showConfirmation) {
                                    router.get(route('reservations.cancel'));
                                    alert('Anda menutup popup pembayaran sebelum menyelesaikan pembayaran');
                                }
                                setIsProcessingPayment(false);
                            },
                            language: 'id'
                        });
                    } else {
                        alert('Terjadi kesalahan saat memproses pembayaran. Token tidak ditemukan.');
                        setIsProcessingPayment(false);
                    }
                },
                onError: (errors: any) => {
                    alert('Terjadi kesalahan saat memproses permintaan.');
                    setIsProcessingPayment(false);
                }
            });
        } catch (error) {
            alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
            setIsProcessingPayment(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center p-4">
            <Head title="Booking Meja - RM PADANG SEJATI" />

            <Link
                href="/"
                className="absolute top-4 left-4 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-300 flex items-center"
            >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline-block md:ml-2">Beranda</span>
            </Link>

            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-amber-600 p-6 text-white text-center relative overflow-hidden">
                    <div
                        id="pattern-background"
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), repeating-linear-gradient(45deg, #ffffff 25%, #ffffff 25%, #ffffff 75%, transparent 75%, transparent)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 10px 10px'
                        }}
                    ></div>
                    <h1 className="text-3xl font-bold mb-2 relative z-10">Booking Meja</h1>
                    <p className="text-amber-100 relative z-10">
                        Reservasi tempat untuk menikmati hidangan lezat kami
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {availabilityError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {availabilityError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-amber-800 block">
                            Nama Lengkap
                        </label>
                        <input
                            id="fullName"
                            value={data.fullName}
                            onChange={(e) => setData('fullName', e.target.value)}
                            placeholder="Masukkan nama lengkap Anda"
                            required
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2"
                            disabled
                        />
                        {errors.fullName && (
                            <div className="text-red-500 text-sm">{errors.fullName}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-amber-800 block">
                                Tanggal
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !data.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.date ? (
                                            format(data.date, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={data.date}
                                        onSelect={(date) => setData('date', date)}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date && (
                                <div className="text-red-500 text-sm">{errors.date}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-amber-800 block">
                                Jam
                            </label>
                            <Select
                                value={data.time}
                                onValueChange={(value) => setData('time', value)}
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
                            {errors.time && (
                                <div className="text-red-500 text-sm">{errors.time}</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="guests" className="text-amber-800 block">
                            Jumlah Orang
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
                            <input
                                id="guests"
                                type="number"
                                min="1"
                                max="20"
                                value={data.guests}
                                onChange={(e) => setData('guests', Number(e.target.value))}
                                placeholder="Masukkan jumlah tamu"
                                required
                                className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md pl-10 py-2"
                            />
                        </div>
                        {errors.guests && (
                            <div className="text-red-500 text-sm">{errors.guests}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-amber-800 block">
                            Catatan
                        </label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Tambahkan catatan khusus (opsional)"
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2"
                        />
                        {errors.notes && (
                            <div className="text-red-500 text-sm">{errors.notes}</div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {processing ? 'Memproses...' : 'Booking Sekarang'}
                    </Button>
                </form>
            </div>

            {/* Payment Confirmation Dialog */}
            {showPaymentDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-amber-800 mb-4">
                            Konfirmasi Pembayaran
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Untuk mengkonfirmasi booking, Anda perlu membayar booking fee sebesar Rp. 100.000.
                            Pembayaran ini akan dikembalikan jika Anda membatalkan reservasi minimal 24 jam sebelum waktu yang ditentukan.
                        </p>
                        <div className="flex space-x-4">
                            <Button
                                onClick={() => setShowPaymentDialog(false)}
                                className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white"
                                disabled={isProcessingPayment}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleConfirmBooking}
                                className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white"
                                disabled={isProcessingPayment || isLoadingMidtrans || !isSnapLoaded}
                            >
                                {isProcessingPayment ? 'Memproses...' : 'Bayar Sekarang'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Confirmation */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-amber-800 mb-4">
                            Pembokingan Berhasil!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Terima kasih telah melakukan pembokingan. Pembayaran Anda telah kami terima.
                        </p>
                        <Button
                            onClick={() => setShowConfirmation(false)}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            )}

            {/* Decorative elements */}
            <div id="utensilsIcon" className="fixed top-10 left-10 text-amber-600 opacity-50">
                <Utensils className="w-12 h-12" />
            </div>
            <div id="bookOpenIcon" className="fixed bottom-10 right-10 text-amber-600 opacity-50">
                <Book className="w-12 h-12" />
            </div>
        </div>
    );
} 
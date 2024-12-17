import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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

interface BookingFormData {
    fullName: string;
    date: Date | undefined;
    time: string;
    guests: number;
    notes: string;
}

export default function BookingDinein() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formData, setFormData] = useState<BookingFormData>({
        fullName: '',
        date: undefined,
        time: '',
        guests: 1,
        notes: ''
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setShowConfirmation(true);
    };

    const handlePayment = () => {
        setShowConfirmation(false);
        alert('Redirecting to payment...');
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
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-amber-800 block">
                            Nama Lengkap
                        </label>
                        <input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Masukkan nama lengkap Anda"
                            required
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2"
                        />
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
                                            !formData.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.date ? (
                                            format(formData.date, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date}
                                        onSelect={(date) => setFormData({ ...formData, date })}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label className="text-amber-800 block">
                                Jam
                            </label>
                            <Select
                                value={formData.time}
                                onValueChange={(value) => setFormData({ ...formData, time: value })}
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
                                value={formData.guests}
                                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                placeholder="Masukkan jumlah tamu"
                                required
                                className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md pl-10 py-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-amber-800 block">
                            Catatan
                        </label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Tambahkan catatan khusus (opsional)"
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {isSubmitting ? 'Memproses...' : 'Booking Sekarang'}
                    </Button>
                </form>
            </div>

            {/* Confirmation Popup */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-amber-800 mb-4">
                            Pembokingan Berhasil!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Terima kasih telah melakukan pembokingan. Silakan lanjutkan ke pembayaran untuk mengkonfirmasi reservasi Anda.
                        </p>
                        <Button
                            onClick={handlePayment}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            Bayar
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
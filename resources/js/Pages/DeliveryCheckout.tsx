import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Mail, MapPin, Phone, Truck, User, ClipboardList } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function DeliveryCheckout() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        deliveryTime: ''
    });

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
            <Head title="Checkout Delivery - RM PADANG SEJATI" />

            <Link
                href="/menu-selection/delivery"
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
                        Checkout Delivery
                    </h1>
                    <p className="text-amber-100 relative z-10">
                        Lengkapi informasi untuk pengiriman pesanan Anda
                    </p>
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
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Alamat
                        </Label>
                        <Textarea
                            placeholder="Masukkan alamat lengkap Anda"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Catatan
                        </Label>
                        <Textarea
                            placeholder="Tambahkan catatan untuk pesanan Anda (opsional)"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Estimasi Pengiriman
                        </Label>
                        <Select
                            value={formData.deliveryTime}
                            onValueChange={(value) => setFormData({ ...formData, deliveryTime: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih waktu pengiriman" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asap">Secepatnya</SelectItem>
                                <SelectItem value="30-60">30 - 60 menit</SelectItem>
                                <SelectItem value="60-90">60 - 90 menit</SelectItem>
                                <SelectItem value="schedule">Jadwalkan Nanti</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                        {isSubmitting ? 'Memproses...' : 'Bayar'}
                    </Button>
                </form>
            </Card>

            {/* Confirmation Popup */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-md w-full p-6 text-center">
                        <Truck className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                        <h2 className="text-2xl font-bold text-amber-800 mb-4">
                            Siap untuk Membayar?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Pesanan delivery Anda telah dikonfirmasi. Silakan lanjutkan ke pembayaran untuk menyelesaikan proses pemesanan.
                        </p>
                        <Button
                            onClick={handlePayment}
                            className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                            Ok, Lanjutkan ke Pembayaran
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
} 
import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Coffee, Eye, EyeOff, Flame, Home, Utensils } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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

        const bounceElement = (element: HTMLDivElement, distance: number, duration: number) => {
            let position = 0;
            let direction = 1;
            setInterval(() => {
                position += direction;
                element.style.transform = `translateY(${position}px)`;
                if (Math.abs(position) >= distance) {
                    direction *= -1;
                }
            }, duration);
        };

        const coffeeIcon = document.getElementById('coffeeIcon') as HTMLDivElement;
        const utensilsIcon = document.getElementById('utensilsIcon') as HTMLDivElement;
        const flameIcon = document.getElementById('flameIcon') as HTMLDivElement;

        if (coffeeIcon && utensilsIcon && flameIcon) {
            rotateElement(coffeeIcon, 50);
            rotateElement(utensilsIcon, 60, -1);
            bounceElement(flameIcon, 20, 30);
        }
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center p-4">
            <Head title="Register" />

            <Link
                href="/"
                className="absolute top-4 left-4 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-300 flex items-center"
            >
                <Home className="w-5 h-5 mr-2" />
                Beranda
            </Link>

            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden">
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
                    <h1 className="text-3xl font-bold mb-2 relative z-10">
                        Daftar Sekarang
                    </h1>
                    <p className="text-amber-100 relative z-10">
                        Bergabunglah dengan keluarga besar Restoran Padang kami
                    </p>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-amber-800 block">
                            Nama Lengkap
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2"
                            placeholder="Masukkan nama lengkap Anda"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-amber-800 block">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2"
                            placeholder="contoh@email.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                    </div>

                    <div className="space-y-2 relative">
                        <label htmlFor="password" className="text-amber-800 block">
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2 pr-10"
                            placeholder="Buat password yang kuat"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-8 text-amber-600"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                        {errors.password && (
                            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                        )}
                    </div>

                    <div className="space-y-2 relative">
                        <label htmlFor="password_confirmation" className="text-amber-800 block">
                            Konfirmasi Password
                        </label>
                        <input
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password_confirmation}
                            className="w-full border border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50 rounded-md px-3 py-2 pr-10"
                            placeholder="Masukkan ulang password Anda"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                </form>

                <div className="px-6 pb-6 text-center text-amber-800">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="text-amber-600 hover:underline">
                        Masuk di sini
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div id="coffeeIcon" className="absolute top-10 left-10 text-amber-600 opacity-50">
                <Coffee className="w-12 h-12" />
            </div>
            <div id="utensilsIcon" className="absolute bottom-10 right-10 text-amber-600 opacity-50">
                <Utensils className="w-12 h-12" />
            </div>
            <div id="flameIcon" className="absolute top-1/2 left-20 text-amber-600 opacity-50">
                <Flame className="w-9 h-9" />
            </div>
        </div>
    );
}

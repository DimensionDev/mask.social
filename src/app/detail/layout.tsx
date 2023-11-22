'use client';

import { useRouter } from 'next/navigation.js';
import type React from 'react';

import ComeBack from '@/assets/comeback.svg';

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (
        <div className="min-h-screen">
            <div className=" flex items-center p-4 ">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={() => router.back()} />
                <h2 className=" text-lg font-black leading-6">Details</h2>
            </div>
            {children}
        </div>
    );
}

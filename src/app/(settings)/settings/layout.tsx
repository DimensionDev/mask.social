import { SettingsList } from '@/app/(settings)/components/SettingsList.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen w-full flex-1 pl-0 md:pl-[61px] lg:pl-72">
            <SettingsList />
            {children}
        </main>
    );
}

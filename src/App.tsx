import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

import { SafetyInspectorPage } from './pages/SafetyInspectorPage';
import { GA4MonitorConsole } from './components/GA4MonitorConsole';
import { Page } from './types';
import { Shield, User } from './components/icons';
import { AFFILIATE_LINKS } from './constants';

// --- Local Components to bypass Git cache/file resolution issues ---
interface NavbarProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    userId: string | null;
    isAuthReady: boolean;
}

const AppNavbar: React.FC<NavbarProps> = ({ currentPage, setPage, userId, isAuthReady }) => {
    const navItems: { name: string; page: Page }[] = [
        { name: 'Home', page: 'home' },
        { name: 'Solutions', page: 'solutions' },
        { name: 'AI Safety Inspector', page: 'inspector' },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button onClick={() => setPage('home')} className="flex items-center space-x-2 shrink-0" aria-label="Go to homepage">
                    <Shield className="w-7 h-7 text-indigo-600" />
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Melotwo</span>
                </button>
                
                <nav className="hidden lg:flex space-x-8">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setPage(item.page)}
                            className={`px-3 py-2 text-sm font-medium transition duration-150 ease-in-out rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                currentPage === item.page
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center space-x-3 md:space-x-4">
                    {isAuthReady && userId ? (
                        <div 
                            id="user-profile-chip" 
                            className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full pl-1.5 pr-3.5 py-1 shadow-sm transition-all hover:bg-indigo-100/50"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
                                <User className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            
                            <span className="font-mono text-xs font-semibold text-indigo-950" title={userId}>
                                <span className="text-indigo-500 font-bold mr-1">Session ID:</span>
                                {userId.slice(0, 6)}...
                            </span>
                        </div>
                    ) : (
                         <div className="h-9 w-32 bg-gray-100 animate-pulse rounded-full"></div>
                    )}
                    
                    <button className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Get Started
                    </button>
                </div>
            </div>
            
            <div className="lg:hidden border-t border-gray-100 py-2 overflow-x-auto">
                 <div className="flex justify-around px-4 min-w-max">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => setPage(item.page)}
                            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                currentPage === item.page
                                    ? 'text-indigo-600'
                                    : 'text-gray-500'
                            }`}
                        >
                            {item.name}
                        </button>
                    ))}
                 </div>
            </div>
        </header>
    );
};

const AppFooter: React.FC = () => (
    <footer className="bg-gray-800 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
            <nav className="flex flex-wrap justify-center -mx-5 -my-2">
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Home</a>
                </div>
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Solutions</a>
                </div>
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Inspector</a>
                </div>
                <div className="px-5 py-2">
                    <a href="#" className="text-base text-gray-300 hover:text-white">Careers</a>
                </div>
            </nav>
            <div className="mt-8">
                <h4 className="text-lg font-semibold text-center text-gray-300 mb-4">Affiliate Links</h4>
                <div className="flex justify-center space-x-6">
                    {AFFILIATE_LINKS.map(link => (
                        <a key={link.id} href={link.url} className="text-sm text-indigo-400 hover:text-indigo-300 transition duration-150 ease-in-out">
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>
            <p className="mt-8 text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Melotwo, Inc. All rights reserved.
            </p>
        </div>
    </footer>
);

// --- Global Setup ---
// These globals are injected by the AI Studio preview environment.
// For GitHub Pages or local development, you may need to rely on the fallback or process.env.
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // 1. Try to get config from the AI Studio global
        let config = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;

        // 2. If valid config not found, check for standard environment variable (common in build pipelines)
        if ((!config || Object.keys(config).length === 0) && typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_CONFIG) {
             try {
                 config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
             } catch (e) {
                 console.warn("Failed to parse REACT_APP_FIREBASE_CONFIG");
             }
        }

        // 3. Fallback: If no config is present, we skip real Auth (Safe for GitHub Pages demo)
        if (!config || Object.keys(config).length === 0) {
            console.warn("No valid Firebase config found. App will run in offline/demo mode with a random User ID.");
            setUserId(crypto.randomUUID());
            setIsAuthReady(true);
            return;
        }

        try {
            const app = initializeApp(config);
            const authInstance = getAuth(app);
            
            const authenticate = async () => {
                try {
                    const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                    if (token) {
                        await signInWithCustomToken(authInstance, token);
                    } else {
                        await signInAnonymously(authInstance);
                    }
                    const currentUser = authInstance.currentUser;
                    setUserId(currentUser?.uid || crypto.randomUUID());
                } catch (error) {
                    console.error("Firebase Auth flow failed:", error);
                    // Fallback to random ID so the app remains usable
                    setUserId(crypto.randomUUID()); 
                } finally {
                    setIsAuthReady(true);
                }
            };

            authenticate();
        } catch (err) {
            console.error("Failed to initialize Firebase app:", err);
            setUserId(crypto.randomUUID());
            setIsAuthReady(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderPage = useMemo(() => {
        return <SafetyInspectorPage />;
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans relative">
            <AppNavbar 
                currentPage={currentPage} 
                setPage={setCurrentPage} 
                userId={userId} 
                isAuthReady={isAuthReady} 
            />
            <main className="flex-grow pt-4">
                {renderPage}
            </main>
            <AppFooter />
            <GA4MonitorConsole />
        </div>
    );
};

export default App;

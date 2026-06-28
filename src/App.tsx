import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SolutionsPage } from './pages/SolutionsPage';
import { SafetyInspectorPage } from './pages/SafetyInspectorPage';
import { GA4MonitorConsole } from './components/GA4MonitorConsole';
import { Page } from './types';

declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        let config = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;

        if ((!config || Object.keys(config).length === 0) && typeof process !== 'undefined' && process.env?.REACT_APP_FIREBASE_CONFIG) {
             try {
                 config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
             } catch (e) {
                 console.warn("Failed to parse REACT_APP_FIREBASE_CONFIG");
             }
        }

        if (!config || Object.keys(config).length === 0) {
            console.warn("No valid Firebase config found. App will run in offline/demo mode.");
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
    }, []);

    const renderPage = useMemo(() => {
        switch (currentPage) {
            case 'solutions':
                return <SolutionsPage />;
            case 'inspector':
                return <SafetyInspectorPage />;
            case 'home':
            default:
                return <HomePage />;
        }
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans relative flex flex-col">
            <Navbar 
                currentPage={currentPage} 
                setPage={setCurrentPage} 
                userId={userId} 
                isAuthReady={isAuthReady} 
            />
            <main className="flex-grow pt-4">
                {renderPage}
            </main>
            <Footer />
            <GA4MonitorConsole />
        </div>
    );
};

export default App;

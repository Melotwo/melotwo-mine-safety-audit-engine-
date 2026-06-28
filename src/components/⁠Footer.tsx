import React from 'react';
import { AFFILIATE_LINKS } from '../constants';

export const AppFooter: React.FC = () => (
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

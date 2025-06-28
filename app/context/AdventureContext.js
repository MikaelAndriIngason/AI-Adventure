'use client';
import { createContext, useContext, useState } from 'react';

const AdventureContext = createContext();

export function AdventureProvider({ children }) {
    const [data, setData] = useState({
        intro: '',
        title: '',
        essentials: ''
    });

    return (
        <AdventureContext.Provider value={{ ...data, setData }}>
            {children}
        </AdventureContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(AdventureContext);
    if (!ctx) throw new Error('useData must be used inside AdventureProvider');
    return ctx;
}

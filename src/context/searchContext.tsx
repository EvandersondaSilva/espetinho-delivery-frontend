"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const SearchContext = createContext<SearchContextProps>({} as SearchContextProps);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    return useContext(SearchContext);
}

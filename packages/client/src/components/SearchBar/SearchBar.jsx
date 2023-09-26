import React, { useState } from 'react';
import "./SearchBar.scss";

const SearchBar = ({ setKeywords }) => {
    const [searchInput, setSearchInput] = useState('');

    const handleSearchInputChange = (event) => {
        const inputValue = event.target.value;
        setSearchInput(inputValue);
        setKeywords(inputValue); // This will update the search keywords as the user types
    };

    const handleClearSearchInput = () => {
        setSearchInput('');
        setKeywords(''); // Clear the search keywords
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={handleSearchInputChange}
            />
            {searchInput && (
                <button onClick={handleClearSearchInput}>Clear</button>
            )}
        </div>
    );
};

export default SearchBar;

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import useDebounce from "@/hooks/useDebounce.jsx";
import axios from "axios";
import { NavLink } from "react-router-dom";

const SearchUser = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // ... keep your existing useEffect and other logic ...
    useEffect(() => {
        const fetchUsers = async () => {
            // 1. Only search if the debounced term is not empty
            if (debouncedSearchTerm) {
                setLoading(true);
                try {
                    // 2. Use the correct API endpoint and query parameter ('query')
                    const res = await axios.get(`http://localhost:8000/api/v1/user/searchUser?query=${debouncedSearchTerm}`, {
                        withCredentials: true
                    });

                    if (res.data.success) {
                        // 3. Set the state with the new array from the API
                        setResults(res.data.users);
                    }
                } catch (err) {
                    console.error("Error fetching search results:", err);
                    setResults([]); // Clear results on error
                } finally {
                    setLoading(false);
                }
            } else {
                // If the search term is empty, clear the results
                setResults([]);
            }
        };

        fetchUsers();

        // 4. The effect ONLY depends on the debounced search term.
    }, [debouncedSearchTerm]);
    return (
        <div className="flex justify-center w-full pt-8 px-4 fixed top-0 z-10">
            <div className="relative w-full max-w-3xl transform transition-all duration-300 hover:scale-[1.02]">
                {/* Backdrop Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/30 to-blue-100/30 
                              rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-70 
                              hover:opacity-100"/>

                {/* Main Card */}
                <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl 
                              p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                              hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]
                              border border-gray-100/80
                              transition-all duration-300">

                    {/* Inner Container with Gradient Border */}
                    <div className="relative overflow-hidden rounded-xl 
                                  bg-gradient-to-r p-[2px] from-red-100 via-white to-blue-100">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-14 px-6 py-4 pl-12 text-lg
                                          rounded-xl
                                          bg-white/80
                                          focus:outline-none focus:bg-white
                                          transition-all duration-300 ease-in-out
                                          placeholder:text-gray-400
                                          text-gray-700"
                            />
                            <Search className="w-6 h-6 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2
                                            transition-all duration-300 group-hover:text-gray-700" />
                        </div>
                    </div>

                    {/* Subtle Bottom Reflection */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent 
                                  via-gray-200 to-transparent opacity-30"/>
                </div>
                {
                    results.length === 0 && (


                        <div className="absolute w-full h-[100vh] mt-2 bg-white rounded-xl shadow-lg border border-gray-100/80
              overflow-hidden flex items-center justify-center">
                            {/* Top Backdrop blur */}
                            <div className="absolute inset-x-0 top-0 h-20 bg-white/80 backdrop-blur-lg" />
                            {/* Left Backdrop blur */}
                            <div className="absolute left-0 top-0 w-20 h-full bg-white/80 backdrop-blur-lg" />
                            {/* Right Backdrop blur */}
                            <div className="absolute right-0 top-0 w-20 h-full bg-white/80 backdrop-blur-lg" />

                            {/* Main Content */}
                            <div className="relative text-center space-y-2 z-10">
                                <p className="text-lg font-medium text-gray-600 animate-pulse">
                                    Enter Username or Email
                                </p>
                                <p className="text-sm text-gray-400 transition-all duration-300 group-hover:translate-y-0
                      translate-y-1 opacity-80 group-hover:opacity-100">
                                    to find amazing people
                                </p>
                            </div>
                        </div>


                    )
                }

                {/* Results Dropdown */}
                {(results.length > 0 || loading) && (
                    <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100/80 
                                  backdrop-blur-lg overflow-hidden">
                        {loading && (
                            <div className="p-4 text-center text-gray-500">Searching...</div>
                        )}
                        
                        {!loading && results.map((user) => (
                            <NavLink 
                                to={`/profile/${user._id}`} 
                                key={user._id} 
                                className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <img
                                    // --- THIS IS THE FIX ---
                                    // If user.profilePicture is empty, use a placeholder.
                                    src={user.profilePicture || `https://placehold.co/40x40/EFEFEF/AAAAAA?text=${user.username.charAt(0)}`}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="ml-3 font-medium text-gray-800">{user.username}</span>
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default SearchUser;
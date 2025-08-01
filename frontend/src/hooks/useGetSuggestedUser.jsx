import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSuggestedUsers } from "@/redux/authSlice.js";

const useGetSuggestedUser = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSuggestedUser = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/v1/user/suggested', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (err) {
                console.log("Error fetching suggested users:", err);
            }
        };

        // --- THE FIX ---
        // Only run the fetch if we actually have a logged-in user.
        if (user) {
            fetchSuggestedUser();
        }

        // The dependency array now safely handles the user object.
        // JSON.stringify is a simple way to make sure the effect re-runs
        // when the content of the arrays change.
    }, [user, dispatch]); // We depend on the whole user object now for simplicity and safety.
};

export default useGetSuggestedUser;
import React from 'react';
import {Outlet} from "react-router-dom";
import LeftSidebar from "@/components/LeftSidebar.jsx";

const MainLayout = () => {
    return (
       // <div>
       //     <LeftSidebar/>
       //     <div>
       //         <Outlet/>
       //     </div>
       // </div>
        // --- THIS IS THE MAIN FIX ---
        // We use a flex container to put the sidebar and the main content side-by-side.
        <div className="flex w-full h-screen">

            {/* --- Sidebar --- */}
            {/* The sidebar has a fixed width and will stay on the left. */}
            <div className="flex-shrink-0">
                <LeftSidebar/>
            </div>

            {/* --- Main Content Area --- */}
            {/* This div will automatically take up the rest of the available space. */}
            <main className="flex-grow w-full overflow-y-auto">
                {/* The <Outlet/> renders your actual page component (like SearchUser.jsx) here. */}
                <Outlet/>
            </main>
        </div>
    );
};

export default MainLayout;
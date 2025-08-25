import React from 'react';

// --- PixelVerseLogo Component ---
// This is the component you'll copy into your project.
// It accepts a `className` prop so you can control its size with Tailwind CSS.

const PixelVerseLogo = ({ className }) => {
    return (
        // The SVG code is returned as JSX.
        // Note that attributes like stroke-width become strokeWidth in React.
        <svg
            className={className}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="PixelVerse Logo"
        >
            {/* Define the gradient used in the logo */}
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    {/* Inline styles in React use camelCase and are passed as objects */}
                    <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#A855F7', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* P Shape */}
            <path d="M20 20 H 50 A 15 15 0 0 1 50 50 H 20 V 80" fill="url(#grad1)" strokeWidth="0"/>

            {/* V Shape (overlapping) */}
            <path d="M50 50 L 65 80 L 80 50 L 65 65 Z" fill="#ffffff" />
            <path d="M50 50 L 65 80 L 80 50" fill="url(#grad1)" fillOpacity="0.8"/>

            {/* Pixel elements */}
            <rect x="25" y="65" width="8" height="8" fill="url(#grad1)" opacity="0.7"/>
            <rect x="38" y="65" width="8" height="8" fill="url(#grad1)" opacity="0.5"/>
            <rect x="51" y="25" width="8" height="8" fill="#ffffff" opacity="0.6"/>
        </svg>
    );
};
export default PixelVerseLogo;



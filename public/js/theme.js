/**
 * theme.js
 * Client-side logic for the cookie-based theme switcher.
 */
(function() {
    'use strict';

    const THEME_COOKIE = 'theme';
    const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
    
    // BroadcastChannel syncs open tabs when the browser supports it.
    const themeChannel = typeof BroadcastChannel === 'undefined'
        ? null
        : new BroadcastChannel('theme_sync');
    
    function isValidTheme(theme) {
        return theme === 'dark' || theme === 'light';
    }

    function readThemeCookie() {
        const themes = document.cookie
            .split(';')
            .map((part) => part.trim().split('='))
            .filter(([name, value]) => name === THEME_COOKIE && isValidTheme(value));

        // Browsers serialize more-specific paths first, so the final value is
        // the new Path=/ cookie if an older page-scoped cookie also exists.
        return themes.length ? themes[themes.length - 1][1] : null;
    }

    function writeThemeCookie(theme) {
        document.cookie = `${THEME_COOKIE}=${theme}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
    }

    function setTheme(theme, broadcast = true) {
        if (!isValidTheme(theme)) return;

        // Update DOM instantly
        document.documentElement.setAttribute('data-theme', theme);
        
        // Persist the explicit preference for every route in this site.
        writeThemeCookie(theme);
        
        // Because icons.js converts <i> to <svg>, we must replace the entire innerHTML
        // with a fresh <i> tag, then immediately call ncReplaceIcons
        document.querySelectorAll('.nc-dark-toggle').forEach(toggle => {
            toggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
        
        // Re-run SVG replacement instantly
        if (window.ncReplaceIcons) {
            window.ncReplaceIcons();
        }
        
        // Sync to other tabs
        if (broadcast && themeChannel) {
            themeChannel.postMessage(theme);
        }
    }
    
    // Listen for theme changes from other tabs
    if (themeChannel) {
        themeChannel.addEventListener('message', (e) => {
            if (e.data === 'light' || e.data === 'dark') {
                setTheme(e.data, false); // false = don't broadcast back
            }
        });
    }

    // Initialize toggle buttons
    document.addEventListener('DOMContentLoaded', () => {
        const toggles = document.querySelectorAll('.nc-dark-toggle');
        
        // Set initial icon state based on what the server/inline-script decided
        // Prefer the cookie over any HTML that might have been cached before a
        // theme change. The inline head script makes this happen before paint;
        // this keeps the controls in sync as well.
        const initialTheme = readThemeCookie()
            || document.documentElement.getAttribute('data-theme')
            || 'light';
        document.documentElement.setAttribute('data-theme', initialTheme);
        
        toggles.forEach(toggle => {
            // Replace the hardcoded moon with the correct icon on load
            toggle.innerHTML = initialTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            
            // Bind click
            toggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                setTheme(next);
            });
        });
        
        // Make sure the initial icons we just set are converted to SVGs
        if (window.ncReplaceIcons) {
            window.ncReplaceIcons();
        }
    });
})();

/**
 * Theme Middleware
 * Reads the theme cookie or Client Hints to determine the user's preferred theme.
 * Sets `res.locals.theme` for all EJS templates.
 */
const VALID_THEMES = new Set(['dark', 'light']);

function getThemeCookie(req) {
    // Cookie headers list more-specific paths first. Selecting the final valid
    // value lets the new site-wide Path=/ cookie win over an old, page-scoped
    // cookie from previous versions of the switcher.
    const values = ((req.headers && req.headers.cookie) || '')
        .split(';')
        .map((part) => part.trim().split('='))
        .filter(([name, value]) => name === 'theme' && VALID_THEMES.has(value))
        .map(([, value]) => value);

    return values.at(-1) || req.cookies?.theme;
}

module.exports = (req, res, next) => {
    // The root-scoped cookie is the user's explicit choice and always wins over
    // the browser/OS preference.
    const activeTheme = getThemeCookie(req);
    
    if (VALID_THEMES.has(activeTheme)) {
        res.locals.theme = activeTheme;
        res.locals.hasThemeCookie = true;
    } else {
        // No cookie. Check Client Hints.
        const ch = req.get('Sec-CH-Prefers-Color-Scheme');
        if (VALID_THEMES.has(ch)) {
            res.locals.theme = ch;
            // Client hint resolves the theme, so we act as if we have the preference
            res.locals.hasThemeCookie = true; 
        } else {
            // Ultimate fallback default is light, but we need the inline script to check OS preference
            res.locals.theme = 'light';
            res.locals.hasThemeCookie = false;
        }
    }
    
    // Tell browsers to send the Client Hint on future requests
    res.setHeader('Accept-CH', 'Sec-CH-Prefers-Color-Scheme');
    // Prevent shared caches from serving a page rendered for another theme.
    res.vary(['Cookie', 'Sec-CH-Prefers-Color-Scheme']);
    
    next();
};

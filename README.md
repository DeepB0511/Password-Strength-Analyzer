# Password Strength Analyzer

A small, private-by-default password checker that runs entirely in your browser.

## Use

Open `index.html` in a modern browser. Type or paste a password to see its strength and which checklist items it meets. Select **Generate** for a random 20-character alternative, then **Copy** to copy it to your clipboard.

The analyzer considers password length, character variety, character repetition, common passwords, and recognizable sequences. Its rating is a practical local estimate, not a guarantee that a password is secure against every attack. Use a different password for every account; a password manager can generate and remember them for you.

Passwords are not sent to a server or saved by this tool. No password-reuse database is configured. Generated passwords use the browser's cryptographically secure random-number generator; generation requires a modern browser with Web Crypto support.

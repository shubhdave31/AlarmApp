---
description: How to start the AlarmApp development server
---
# Start Development Server (Tunnel Mode)

The user environment requires using the `--tunnel` flag due to local firewall restrictions. Always use this workflow to start the server.

1.  Kill any existing Node/Expo processes to ensure a clean slate.
    ```powershell
    taskkill /F /IM node.exe
    ```
    *(It is safe to ignore "process not found" errors)*

2.  Start the server with the tunnel flag and redirect output to a log file for URL retrieval.
    ```powershell
    // turbo
    npm start -- --port 8087 --clear --tunnel --dev-client > server_output.txt 2>&1
    ```
    *Note: We redirect output because the tunnel URL doesn't always show up in the standard stdout stream immediately.*

3.  Retrieve the Connection URL.
    - Read `server_output.txt`
    - Look for the URL starting with `exp://...exp.direct`
    - Provide this URL to the user.

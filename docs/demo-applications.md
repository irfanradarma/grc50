# Demo applications

Admin → Demo Aplikasi provides three independent choices: SIGNAL (Beyond Compliance), AMS, and Continuous Risk Assurance (AI in Audit and Beyond). Stop the current broadcast before selecting another application. Selecting an application does not change the published topic or deck.

The audience live modal includes **Open app in new tab**, pointing to the selected participant application. These public links contain no admin credentials:

- `/audience/?demoApp=signal`
- `/audience/?demoApp=ams&workspace=audit`
- `/audience/?demoApp=continuous-risk&workspace=risk`

AMS and Continuous Risk Assurance share practice data in the same browser. Presenter practice data uses a separate storage key. SIGNAL retains its existing authenticated participant and isolated presenter workspaces.

This release updates both the frontend and API: broadcast status now includes `appId`. Deploy the API on Render, then run the GitHub Pages workflow. No database migration or environment variable changes are required. Older API clients that omit `appId` still start SIGNAL.

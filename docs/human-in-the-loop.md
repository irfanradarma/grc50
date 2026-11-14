# Human-in-the-loop: document review (v2)

Session controls are in Admin > Signals & participants. Open or close a session there. The Human-in-the-loop iframe in Demo Aplikasi renders the participant game, including name entry and Finish; it contains no session controls. It authenticates with an isolated presenter guest workspace. Presenter attempts are excluded from participant counts and the leaderboard.

Five teaching documents: strategy slide, three-page credit-limit audit report, receivables dashboard, data policy memo, and management brief. The first three contain unsupported or incorrect content; the latter two are sound. Each document is rendered as a work artifact with page navigation and zoom. Participants click exact locations to place numbered pins, and can remove any pin before Finish. Coordinates are normalized to the document bounds so scoring is independent of zoom. Keyboard arrows move a cursor and Enter places a pin. All pages and pins persist while moving between contents.

Only the API contains answer rectangles. It validates five answer arrays, page bounds, normalized finite coordinates and a maximum of 12 pins per artifact. Each artifact is worth 20 points; wrong or duplicate pins cost 5 points, with a floor of zero. Sound artifacts earn full credit when unmarked. Duration is measured on the server; score ranks before elapsed time. This is a teaching exercise, not a controlled examination.

A v2 session must be opened after deployment. Old block-selection sessions cannot accept coordinate submissions. New sessions replace previous results after confirmation. Data remains in the shared seminar room JSON field; no database migration is required. Deploy API then Pages. Reopen the demo iframe after deploying both.

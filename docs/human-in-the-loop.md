# Human-in-the-loop practice

In Admin → Demo Aplikasi choose Human-in-the-loop, open a session, then broadcast. Participants use the modal's new-tab link, enter a public display name and review five fictional outputs. Three contain unsupported claims or incorrect figures; two are sound. Clicking a block toggles its flag. Previous/Next retain answers; Finish submits once.

Each entirely correct card earns 20 points. Marking extra blocks loses that card's points. Server elapsed time starts at joining and ends at submission. Ranking uses score descending, then duration ascending. This is a teaching exercise, not a controlled examination; devices and connections can affect timing.

Close the session to reveal the leaderboard and explanations. Unfinished participants are excluded. Opening a new session replaces previous results after confirmation. Session data persists under the shared seminar room's `hitl` JSON field, with row locking; no database migration is required. Deploy both API and Pages.

The new built-in slide is inserted after `aib-human-authority`, including stored copies of this built-in topic that retain that anchor. Other topic edits are preserved.

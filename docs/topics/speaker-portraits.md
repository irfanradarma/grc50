# Speaker portraits

The RSM topic speaker slide uses two transparent portrait edits produced with the built-in ImageGen tool on 13 November 2026. The original HORI suit portrait remains unchanged. Names and RSM affiliation are rendered as editable HTML, outside the images.

- `website/assets/images/dena-sucianandika-portrait.png`: enhanced from the small speaker-supplied photograph. Facial detail is an AI-assisted reconstruction from a low-resolution reference.
- `website/assets/images/teuku-raja-irfan-radarma-batik.png`: clothing edit of the existing HORI portrait, replacing the suit with batik.
- `website/assets/images/teuku-raja-irfan-radarma-batik-smooth.png`: speaker-slide derivative retouched with built-in ImageGen on 14 November 2026 to match Dena's softer studio finish. The earlier batik portrait remains available. The slide renders the roles and all five credentials supplied for each speaker as editable HTML.

## Access and speaker update 14 November 2026

The cover and presentation guide display the confirmed access link `https://tinyurl.com/rsm-ai-audit`. Both speakers are identified as Technology Consulting Manager, RSM Indonesia. Credentials are supplied by the user and stored in `audit-beyond-topic.json`; this update does not assert independent credential verification.

Final smoothing prompt used with the built-in ImageGen tool, using Irfan as the edit target and Dena only as the finish reference:

> Retouch FIRST image only: Irfan in batik, crossed arms. Second image Dena is ONLY the desired soft skin finish, never transfer identity. Targeted revision: the FIRST image forehead still has unnaturally embossed/wavy coarse texture. REMOVE those fine etched forehead ripples and smooth forehead, cheek and nose skin to match the professionally softened studio skin finish in the SECOND image. Make the skin smoothing clearly visible, with even gentle skin tone, natural subtle texture and no coarse etched lines. Preserve Irfan's exact face shape, facial identity, expression, clear glasses, facial hair, hair, teeth, eyes, ears, exact batik pattern and pose. Keep hair, eyes, glasses, facial-hair strands and batik sharp. Keep same full portrait framing. No other changes. Preserve genuine transparent alpha outside the person, no background or halo. Single Irfan portrait only.

## Final prompts

### Teuku Raja Irfan Radarma

Identity-preserve photo edit for professional speaker portrait. This is Teuku Raja Irfan Radarma. Preserve his exact face, skin tone, clear glasses, hairstyle, smile, body proportions and crossed-arm pose. Replace ONLY navy business suit, shirt and tie with an elegant long-sleeved Indonesian brown and navy batik shirt, conventional formal batik collar, tasteful authentic batik motifs similar to the other speaker's brown batik. Remove existing background entirely to genuine transparent alpha. Crisp studio portrait, realistic photographic texture, waist-up with both elbows and complete head inside frame, no text, no logo. Do not beautify or change his identity. Output a single person only.

### Dena Sucianandika

Edit target: the SMALL SQUARE attached photo of Dena Sucianandika wearing brown batik, NOT the man in navy suit from the other photo. Identity-preserve professional photo cleanup: preserve Dena's precise facial identity, glasses, hairstyle, facial hair, expression and original brown batik shirt pattern. Cleanly remove the blue-gray background to true transparent alpha. Improve clarity conservatively from this low resolution source without inventing a different face. Show the same head and shoulders with full head, centered portrait and shirt to mid chest; do not invent hands. No text, no logos. Single person: Dena only. This portrait will be displayed beside another speaker, output as standalone portrait.

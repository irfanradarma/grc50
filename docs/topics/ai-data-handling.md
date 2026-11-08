# Everyday AI use: documents, CLI agents and the sweet spot

This module is for a professional using a chatbot or CLI agent in daily audit work. It does not teach how to develop an AI platform. Slides 8–13 of **AI in Audit and Beyond** retain their original links and positions. Content is in English; detailed presenter notes are in Indonesian.

## General-audience presentation

The visible story starts with **“When I upload a document to ChatGPT, what happens?”** and **“What if I give an AI agent access to my folders?”**. Browser, document, folder, laptop, online-service and answer illustrations show the real actions. The pictures are explanatory drawings, not screenshots of a particular product version.

Use everyday wording on screen: **what AI reads**, **what goes online**, **what is kept**, **which files it may open**, and **check the answer**. Keep terms such as inference, context, stdout, sandbox and network egress in technical notes and optional discussion. The simplified drawings do not remove the underlying qualifications: an account’s rules still matter, and a folder name alone does not restrict access.

## Show where the data is

Slides 8, 9 and 13 now use two locations: **On your computer** and **Cloud / Internet**. The original file or folder stays visibly on the computer. A blue document moves toward the online service; a green answer returns. The cloud copy remains represented separately: receiving an answer does not erase what was sent.

The 18-second loop starts automatically. Use **Pause movement**, **Resume movement** and **Replay** while explaining. All key labels remain visible throughout. On phones the locations stack vertically and the arrows move vertically; the original, online information and return path remain readable. Reduced-motion settings stop the animation; print preserves the locations and directions.

Cloud is an online service, not a public posting. These drawings do not establish a storage country, a retention period or who may access the data. Those depend on the actual service, account, settings and agreement. The loop replays an example; it does not depict a deletion event.

## The six-slide narrative

| Slide | Message | Interaction |
|---|---|---|
| 8 | The original stays; an uploaded copy goes online. | Follow the blue document and green answer between computer and cloud. |
| 9 | Working on a laptop can still involve online AI. | Follow information read by the CLI agent while the folder stays local. |
| 10 | Check six things before the first prompt. | Account; improvement/feedback; retained copies; permissions; recipients; output. |
| 11 | Give the agent a narrow task, not the whole archive. | Contrast the master client archive with a staged task folder and real read restrictions. |
| 12 | The minimum necessary context depends on the method. | Change the task, work method, information sent and account; confirm four checks. |
| 13 | Keep the full report; share only an approved relevant part. | Compare what stays on the computer with the smaller part sent online. |

## Technical distinctions to make explicit

- A hosted chatbot receives attachments or pasted contents. A cloud-backed CLI agent may read local files and send selected text and tool results to remote inference. Local execution does not establish local inference.
- A read-only mode concerns modifications in its scope. It is not proof that readable content cannot leave the device. Shell networking restrictions do not necessarily govern hosted inference, search, apps or MCP paths.
- Stdout, file-search matches, filenames and error traces can disclose sensitive data. Running a script locally through an agent is not necessarily keeping the data out of model context.
- A separate task folder helps selection. Its name, the working directory, .gitignore and a prompt instruction do not establish a universal read boundary. Use supported tool permissions or OS isolation and test their coverage.
- Inference, retained application data and model-improvement use are different questions. A no-training statement does not prove zero retention or zero processor access.
- Personal paid subscriptions, commercial workspaces and API tools can have different terms. Check the exact account and feature rather than borrowing another product’s policy. Uploaded files, chats, memory, connected data and feedback can have different lifecycles.
- Removing names is not guaranteed anonymisation. Aggregates and small groups may still identify a subject. Review necessity and disclosure authority before sharing.

## Concrete example: approval exceptions

1. **Ask for the method.** Give the authorised AI tool column names, approval criteria and fictitious examples. Ask for code that checks approval exceptions and returns only necessary fields.
2. **Review and test.** Check logic, file access, dependencies, networking and output. Test with fictitious positive and negative cases. Generated code is not trusted merely because it runs.
3. **Execute privately.** A human runs the reviewed code in a trusted local environment on client records kept outside the agent’s effective access. This is a separate local run, not a cloud code interpreter or an agent command that returns stdout to the model.
4. **Inspect the summary.** Validate exceptions and consider re-identification. Approve only the facts needed for the next task; avoid raw rows, identifying paths and unnecessary narrative.
5. **Draft and verify.** Ask AI to draft from the approved facts and criteria. The auditor verifies the evidence, cause and wording before signing the workpaper.

This can improve productivity by changing the division of labour, rather than disclosing an entire archive. It is a teaching pattern, not an RSM or client policy decision.

## Sweet-spot demonstration

Start with **Check approval exceptions / cloud-backed CLI / reviewed necessary extract**. With an approved account and all checks confirmed it is a candidate, not a safety certificate. Change the input to **schema / fictitious example**: insufficient for direct record review. Then change the method to **AI writes code · human runs locally**: schema can now be enough for AI’s part of the task. Genuine rows stay in the separate local analysis.

A generic report outline also needs little context. A client finding needs approved facts and criteria: a schema alone cannot substantiate it. The original-pack option is explicitly **unreviewed** and prompts minimisation in these examples; it does not prohibit all authorised use of detailed evidence.

The plot is qualitative. It is neither a measured productivity/privacy scale nor a provider ranking. Checkboxes do not verify implementation. No document is uploaded and no model is connected by the interaction.

## Primary references and scope

- [OpenAI: Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security) — agent approvals, sandboxing and command network controls; not proof of offline inference.
- [OpenAI: ChatGPT Work enterprise overview](https://learn.chatgpt.com/docs/enterprise/chatgpt-work-overview) — Enterprise/Edu Work data and feature lifecycles; do not generalise to all personal chat or API accounts.
- [Anthropic: Claude Code data usage](https://code.claude.com/docs/en/data-usage) — consumer versus commercial terms and separate improvement/feedback conditions.
- [Anthropic: Claude Code permissions](https://code.claude.com/docs/en/permissions) — supported tool and file-read rules; verify actual coverage.
- [Anthropic: Claude Code user FAQ](https://support.claude.com/en/articles/14554922-claude-code-user-faq) — local code reading and hosted processing in that product.
- [OWASP: Sensitive information disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) — minimisation, least privilege and disclosure controls.
- [OWASP: Prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — evidence can contain untrusted instructions; prompts alone do not enforce tool permissions.

Provider documentation reviewed 7 November 2026. Terms and capabilities are product-specific and can change. Recheck the applicable agreement, account and feature before using client documents.

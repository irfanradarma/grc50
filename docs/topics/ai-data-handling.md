# Everyday AI use — concise refresher

Reviewed 13 November 2026. Practical general guidance, not a tutorial or permission to upload confidential information.

## Opening: three lessons

**Slide 5 — two familiar ways to work.** A web chatbot receives a question, pasted information or an attachment. An agent, for example through a CLI, reads files and uses tools within its permissions. Capabilities overlap; what matters is what the tool may read and do.

**Slide 6 — where information goes.** Toggle between chatbot and CLI agent. The animation separates the computer from an online service. The original file can remain while a copy or selected contents go online. Receiving the answer does not remove what was transmitted. The diagram does not promise a storage country or show public posting.

**Slide 7 — share deliberately.** Use an approved account; minimise content and access; review results. Where offered, choose the applicable model-improvement opt-out and verify account terms. The switch is an illustration, not a product screenshot or verified menu path.

Keep these questions separate: **may I share it; is it used for training; what is stored and accessible; where and how is it processed?** A no-training control answers only part of this.

## Confidential audit work (slide 15)

- **Approved environment:** authority, appropriate account/service terms, training-use controls, access, retention/deletion, minimum necessary content and reviewed outputs. A paid personal subscription alone does not establish approval.
- **No approved route for raw data:** ask for a method, outline or code using made-up examples. Review and run code yourself with trusted local tools, outside agent access to raw records. Share only an authorised summary if permitted. Local or read-only agents may still transmit information to hosted models.

This is a practical operating pattern, not a universal product or safety guarantee. Client obligations, contracts, law and policy determine what is allowed. Never promise zero retention or offline processing without checking the actual service and feature.

## Primary references and scope

- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data): API training defaults and retention are distinct; not a personal-chatbot policy.
- [ChatGPT Work overview](https://learn.chatgpt.com/docs/enterprise/chatgpt-work-overview): organisational features have specific product scope.
- [Agent approvals/security](https://learn.chatgpt.com/docs/agent-approvals-security): permissions are different from inference location.
- [Claude Code data use](https://code.claude.com/docs/en/data-usage) and [permissions](https://code.claude.com/docs/en/permissions): account-specific handling and scoped access.
- [OWASP sensitive disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/): disclosures can affect outputs and integrations.

The older sweet-spot evaluator remains in the renderer for compatibility; the active topic no longer has a six-slide tutorial. These deck interactions send no document or prompt to an AI service.
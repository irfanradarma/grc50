# Managing Risk in the Era of AI: Beyond Compliance

**Working seminar plan — for brainstorming**  
**Duration:** 60 minutes, including demonstrations and Q&A  
**Draft date:** 11 October 2026  
**Assumed audience:** risk managers, internal auditors, assurance practitioners, and organizational leaders  
**Two pillars:** Risk Assurance through AI; Assuring AI Risk

**Delivery format:** one seminar website, hosted on the presenter's domain later, containing the HTML presentation deck and the demonstration app experience. Domain and hosting decisions remain open; this plan does not initiate deployment.

**Part II foundation:** the AI Audit approach developed by the presenter in Kemenkeu, grounded in [03 - Alat dan Teknik Audit AI.pdf](../sources/03%20-%20Alat%20dan%20Teknik%20Audit%20AI.pdf). The material describes technical guidance and a developing framework; distinguish this from formal regulation when presenting its institutional status.

## 1. Central message

Risk management should help organizations protect and achieve their objectives. AI can help turn periodic documentation into a continuous cycle of sensing, interpreting, deciding, acting, and learning. The AI used in that cycle must itself be governed and assured.

Suggested opening question:

> When did your risk register last change a management decision?

Suggested recurring message:

> Better risk management means better decisions, timely action, and evidence that the action worked.

“Beyond compliance” means pursuing operational outcomes, resilience, public value, and informed risk-taking while meeting applicable obligations. Compliance remains necessary; it is one part of the value proposition.

## 2. What participants should take away

By the end, participants should be able to:

- Describe how AI can support the risk management cycle, including identification, assessment, response, monitoring, and review.
- Explain how external intelligence and internal monitoring can trigger a risk reassessment.
- Distinguish management monitoring, continuous assurance, and project-based assurance, and explain how they reinforce each other.
- Identify the evidence and controls needed to trust an AI-supported workflow.
- Choose one practical pilot with a clear objective, accountable owner, and measurable outcome.

## 3. Proposed 60-minute flow

| Time | Minutes | Segment | Main outcome |
|---|---:|---|---|
| 00–05 | 5 | Opening: the risk register versus the real world | Establish the problem and define beyond compliance |
| 05–12 | 7 | Part I: AI-supported identification | Demonstrate objective-linked risks supported by internal and external evidence |
| 12–20 | 8 | Part I: adaptive assessment and response | Show how new evidence changes a decision and triggers action |
| 20–27 | 7 | Part I: SIPT/CMCA and project-based assurance | Connect continuous signals to focused assurance work; short selfassess.id and AMS demonstrations |
| 27–31 | 4 | Bridge: who assures the AI? | Expose a failure in the same workflow |
| 31–40 | 9 | Part II: Kemenkeu's established AI Audit approach | Explain its purpose, actual methodology, and lessons from development; connect them to AI risk |
| 40–48 | 8 | Part II: apply the AI Audit approach | Walk through a shareable case and show an assurance question, test, evidence, finding, and decision |
| 48–53 | 5 | Implementation and closing | Give participants a practical first step and outcome measures |
| 53–60 | 7 | Q&A | Discuss application to participants' organizations |
| **Total** | **60** | | |

The transition and closing apply to both pillars. Keep Part I demonstrations to approximately 8–10 minutes in total, embedded in the relevant segments. Part II should include a short test demonstration rather than become a list of frameworks.

## 4. Opening: challenge the status quo carefully

Use the following as recognizable failure modes to test with the audience, rather than universal claims about all risk management.

| Common failure mode | Why it matters | Aim with AI | Essential qualification |
|---|---|---|---|
| Subjective judgments with weak supporting evidence | Ratings are hard to challenge or reproduce | More evidence-based, consistent, and traceable judgments | AI can reproduce bias and generate unsupported conclusions |
| Clerical effort dominates | Practitioners spend more time maintaining documents than investigating exposure | More time for analysis, challenge, and decisions | Faster paperwork alone is a limited improvement |
| Repetitive, periodic exercises | The register lags behind changing conditions | Adaptive reassessment when material evidence arrives | Triggers need thresholds and review to avoid alert fatigue |
| Limited influence on decisions | Risks exist in a register without changing resource allocation or action | Impactful advice tied to objectives and decisions | Value must be measured through outcomes, not output volume |

Prefer “more evidence-based” to an unqualified promise of “objective.” AI can support objectivity; data quality, assumptions, incentives, and human judgment still matter.

Audience interaction: ask for a show of hands on whether risk updates are mainly calendar-driven or event-driven.

## 5. Part I — Risk Assurance through AI

### 5.1 Start with objectives and context

AI should understand what the organization is trying to achieve before proposing risks.

Internal inputs might include the organization profile, strategy, objectives, performance targets, process maps, risk appetite, existing risks, incidents, and control descriptions. External inputs might include official announcements, credible news, industry developments, and supplier information.

Use a recurring fictional case throughout the seminar:

> An organization aims to deliver a critical public service within five working days. It depends on a technology supplier and uses an AI assistant to interpret risk signals.

All demonstration data should be synthetic or explicitly approved for use. Keep organization identifiers and sensitive records out of publicly accessible AI services.

### 5.2 Risk identification: collaborative and continuous

Proposed workflow:

1. Read the internal context and identify the objectives that could be affected.
2. Retrieve relevant external signals and retain their source, publication date, and event date.
3. Evaluate credibility, corroboration, timeliness, and relevance to the organization.
4. Draft a cause–event–impact risk statement linked to an objective.
5. Compare it with existing risks to suggest a new risk, an update, or no material change.
6. Present evidence, assumptions, uncertainty, and a proposed owner for human review.
7. Record the accepted decision and reasons, including rejected proposals.

Demonstration: provide an organization profile, one objective, an existing risk register, and a small set of dated source excerpts. Ask AI to propose a risk with citations and explain why it matters to that objective.

Then introduce a new supplier disruption report. Show the distinction between a signal, an emerging exposure, and a confirmed incident. A news item should trigger review when relevant; it should not automatically establish that a risk has materialized.

Periodic ingestion can be the first practical step. Near-real-time ingestion is useful only where data access, event urgency, and response capacity justify it.

**Visible output:** a proposed risk entry with source references, affected objective, assumptions, review status, owner, and next action.

### 5.3 Risk assessment: agile, explainable, and decision-oriented

Combine external signals with internal evidence: service delays, incidents, exception rates, supplier performance, control-test results, and unresolved findings.

Explain the difference between:

- Inherent exposure before considering controls.
- Residual exposure considering controls and evidence of their effectiveness.
- Confidence in the assessment, which may be low even when a risk rating is high.

AI can propose scenarios and rating changes, but the assessment should show the organization's rating criteria, supporting evidence, uncertainty, and sensitivity to assumptions. Avoid invented probability estimates and false precision.

Demonstration: show the original assessment, introduce a rise in service delays and the supplier signal, then show a proposed reassessment. Require AI to explain what changed and what additional evidence is needed.

**Decision to show:** whether to escalate, investigate, strengthen a control, activate a contingency, or retain the rating while gathering evidence.

### 5.4 Risk response: make the analysis consequential

Do not stop at a revised heatmap. Compare response options against expected benefit, cost, feasibility, urgency, and risk appetite.

For the recurring case, possible responses include validating the supplier report, testing a fallback service, tightening exception escalation, and arranging a focused review. Assign an owner, deadline, approval level, and measure of effectiveness.

Humans remain accountable for accepting exposure, allocating resources, and authorizing consequential actions. AI recommendations should be challengeable and reversible where feasible.

### 5.5 SIPT and CMCA: connect signals to risk decisions

Use the presenter's Kemenkeu example to explain the intended relationship between the risk platform and CMCA platform. Confirm the spelling and official expansion of **SIPT** before preparing slides; do not assume it is interchangeable with SPIT.

Conceptual flow:

> Objective → registered risk → control and indicator → monitoring signal → validation → reassessment or investigation → response → effectiveness review → updated risk understanding.

CMCA can make risk management relevant by connecting risk hypotheses to observable transactions, exceptions, and control performance. It can support continuing assurance outside individual audit projects.

Distinguish roles: management operates controls and monitoring; independent assurance evaluates the adequacy and effectiveness of those arrangements. A dashboard or anomaly alert is an input to assurance, rather than sufficient assurance on its own.

Show an exception moving through the full flow. Explain who validates it, who owns the risk, what triggers escalation, and how resolution feeds back into the register.

Label this as a conceptual integration unless the demonstrated system actually implements the connection. Confirm current platform capabilities before claiming live automation.

### 5.6 Why project-based assurance remains necessary

Continuous monitoring provides coverage for defined signals. Focused audits and assessments remain valuable for questions requiring deeper investigation, such as:

- Root causes behind recurring exceptions, including incentives, governance, process design, and capability gaps.
- Whether the monitoring rules themselves miss important risks.
- Control design and operating effectiveness beyond the monitored population.
- Independent challenge, material judgment, and required regulatory or contractual assurance.
- Whether corrective action resolves the cause and improves the outcome.

AI may suggest root-cause hypotheses. Interviews, corroborating evidence, and appropriate testing are still needed to substantiate them.

**selfassess.id demonstration — approximately 2 minutes:** show one selected COBIT objective or ISO requirement, the associated evidence, an AI-supported assessment proposal, and the human review decision. Choose the exact ISO standard beforehand. Explain that a self-assessment does not by itself establish certification or independent assurance.

**AMS demonstration — approximately 2 minutes:** follow one monitoring signal into a focused assurance engagement. Show the relevant planning or evidence-analysis capability and the review trail only where implemented. Use this as the next step in the recurring case, rather than a separate product tour.

## 6. Bridge — the assurance tool introduces its own risk

Suggested transition:

> We have used AI to challenge our risk assumptions. What evidence would allow us to trust the AI's own conclusions?

Introduce one controlled failure: a fabricated citation, a stale source, or an instruction embedded in a retrieved document that tries to redirect the AI. Show how a plausible-looking answer could produce an incorrect escalation or conceal a real exposure.

The same workflow now becomes the subject of Part II.

## 7. Part II — Assuring AI Risk

### 7.0 Lead with the AI Audit approach developed in Kemenkeu

This part should lead with the presenter's experience developing the AI Audit approach already established in Kemenkeu. Give the audience a practical account of how AI assurance is structured and used in that context.

Suggested narrative, to populate from the actual materials:

1. **The need:** what organizational problem led to developing AI Audit?
2. **The scope:** what AI systems, uses, and lifecycle stages does the approach cover?
3. **The method:** what are its actual domains, criteria, procedures, evidence requirements, and reporting structure?
4. **Application:** walk through a shareable or synthetic example using the real method.
5. **Lessons:** what was learned during development or application, and what should other organizations adapt?
6. **Beyond compliance:** how do findings influence use-case boundaries, controls, management decisions, and outcomes?

Attribute the presenter's development role clearly. Distinguish development experience from implementation results; include adoption, audit outcomes, or effectiveness claims only where supported by shareable evidence.

The supplied PDF now provides the methodological foundation; see Section 13 for the source map and proposed interactive demonstration. The risk examples and test pack below remain supporting teaching material.

### 7.1 Define what is being assured

Assure the complete use case: purpose, users, data, model, retrieval sources, permissions, human decisions, integrations, vendors, and consequences. Testing the model alone leaves much of the workflow unexamined.

Differentiate an assistant that drafts a risk statement from an agent that can change records, send notifications, or execute actions. Greater authority and greater consequence require stronger controls and evidence.

### 7.2 Select risks that matter to the case

| AI risk | Example in the seminar case | Consequence | Evidence or control to examine |
|---|---|---|---|
| Unsupported output or fabricated sources | AI invents evidence for a supplier problem | Wrong prioritization or escalation | Source verification, grounded outputs, unsupported-claim testing |
| Poor or stale data | Old reports are treated as current | Incorrect assessment | Provenance, freshness checks, access controls, corroboration |
| Bias and incomplete coverage | Only prominent suppliers or widely reported events are considered | Material risks are overlooked | Coverage tests, relevant scenario sets, expert challenge |
| Confidentiality and privacy | Sensitive records enter an unsuitable service | Disclosure or misuse | Data classification, minimization, retention and vendor settings |
| Prompt injection and excessive authority | Retrieved text redirects the assistant or an agent changes a risk without approval | Manipulated conclusions or unauthorized action | Untrusted-content handling, permission limits, approval gates, adversarial tests |
| Automation bias | Reviewer accepts a confident rating without checking | Human review becomes ineffective | Review criteria, evidence visibility, override records, reviewer testing |
| Model or vendor changes | An update changes assessment behavior | Previously accepted performance no longer holds | Version records, regression tests, change approval, fallback |
| Service dependency and failure | AI service becomes unavailable | Monitoring or response is delayed | Continuity tests, manual fallback, incident procedures |

Use four or five examples orally; keep the remaining rows as reference material.

### 7.3 Organize assurance with a practical framework

Use the actual Kemenkeu AI Audit methodology as the main structure for the seminar. The international references below can provide context or a supplementary mapping; do not imply that the established methodology was based on them unless its documentation confirms this.

Use the NIST AI Risk Management Framework's **Govern, Map, Measure, and Manage** functions as a useful organizing lens. These are related functions, not a one-time linear checklist. [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework), [NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook).

- **Govern:** Who owns the use case, approves its boundaries, and remains accountable? What is the role of independent challenge?
- **Map:** What objective does it serve, who may be affected, and what happens if it fails or is misused?
- **Measure:** What testing demonstrates acceptable performance and control effectiveness in representative and adverse conditions?
- **Manage:** What decision follows the evidence: approve, restrict, improve, suspend, or retire? How are incidents and changes handled?

For generative AI examples, consult the NIST Generative AI Profile. For an internal audit perspective, use The IIA's AI Auditing Framework as supporting guidance. [NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf), [The IIA AI Auditing Framework](https://www.theiia.org/en/content/tools/professional/2023/the-iias-updated-ai-auditing-framework/).

Keep framework coverage brief. The substantive question is whether controls work for this use case and whether the remaining exposure is acceptable.

### 7.4 Mini-demonstration: assure the risk-identification assistant

Apply the relevant criteria and procedures from the Kemenkeu AI Audit approach to this assistant. Alternatively, use a shareable example from that approach if it better illustrates its scope. Present the proposed test pack below as an illustrative exercise until mapped to the actual method.

**Assurance question:** Can the assistant propose evidence-supported risks without being redirected by untrusted sources or acting beyond its authority?

Prepare a small test pack:

1. A valid, relevant source with a verifiable event.
2. A stale source that should not be presented as current.
3. An unsupported claim that should be flagged for verification.
4. An irrelevant source that should not cause a new risk entry.
5. A retrieved document containing a malicious instruction.
6. A request to change the register without the required approval.

Define expected behavior before running the tests. Inspect the output, retrieved evidence, review record, and action log. Demonstrate two tests live and summarize the remainder.

**Example finding:** the assistant correctly links a valid signal to the objective, but fails to flag an old source. **Decision:** restrict use to reviewed drafts, implement freshness checks, and retest before broader deployment.

Passing a small demonstration test pack does not establish production reliability. A real engagement needs representative cases, documented acceptance criteria, suitable sample coverage, and repeat testing when material changes occur.

### 7.5 Make human oversight concrete

“Human in the loop” needs an actual operating design:

- Identify the reviewer, their competence, and the decisions reserved for them.
- Provide the evidence, limitations, and uncertainty needed for meaningful challenge.
- Give enough review time and a usable way to reject or override proposals.
- Record the decision and rationale, and test whether review catches planted errors.
- Define escalation, suspension, and fallback arrangements when confidence or control performance is inadequate.

Management owns AI risk; risk and compliance functions support and challenge management; internal audit provides independent assurance within its mandate. Independence deserves attention where auditors help design AI workflows they may later assess.

## 8. Closing: a practical first move

Propose a bounded pilot: one organizational objective, one risk family, a small approved source set, and a defined human review point.

Suggested first-month sequence:

1. Establish the current workflow, baseline effort, missed signals, and decision delays.
2. Build an evidence-linked draft workflow with clear permissions and ownership.
3. Test normal cases, adverse cases, reviewer effectiveness, and fallback.
4. Review outcomes and remaining exposure before expanding the scope.

Measure value through time from signal to review and action, accepted versus rejected alerts, material missed signals, evidence quality, verified control improvements, and progress against the underlying service objective. Efficiency measures should be paired with quality and outcome measures.

Suggested closing line:

> Use AI to make risk management more responsive and useful. Use assurance to establish where that AI can be trusted, under what conditions, and with what limits.

## 9. Demonstration preparation

- Use one recurring case across risk identification, reassessment, CMCA, project assurance, and AI assurance.
- Prepare a one-page organization profile, one measurable objective, three existing risks, dated source excerpts, and a small synthetic exception dataset.
- Prepare a before-and-after risk entry, response decision, monitoring result, and human review trail.
- Verify the exact SIPT terminology, platform integration, selfassess.id workflow, and AMS features shortly before the seminar.
- Prepare screenshots or a short recording for each live demonstration, including the controlled failure and its remediation.
- Use preloaded sources and saved outputs where live retrieval would consume time or make results unpredictable.
- Show evidence and decisions prominently; keep product navigation short.

## 10. Suggested slide/storyboard outline

1. When did your risk register last change a decision?
2. Beyond compliance: objectives, decisions, and outcomes.
3. From clerical cycles to an evidence-driven feedback loop.
4. The recurring case and its objective.
5. Identification: internal context meets external intelligence.
6. Demonstration: a signal becomes a proposed risk update.
7. Assessment and response: what changed, and what should we do?
8. SIPT/CMCA: connecting exposure, controls, and signals.
9. Continuous and project-based assurance: complementary roles.
10. selfassess.id and AMS: evidence, review, and follow-through.
11. Who assures the AI? A controlled failure.
12. AI risk across the complete workflow.
13. Kemenkeu AI Audit: why it was developed and how the actual method works.
14. Apply the method: test, evidence, finding, decision; lessons from development.
15. Meaningful human oversight and accountability.
16. A bounded pilot and measures of value.
17. Closing and Q&A.

## 11. Choices for the next brainstorming round

- Audience balance: executives, risk practitioners, auditors, or a mixed group?
- Preferred speaking language: English, Indonesian, or bilingual terminology?
- Which organizational case will be most recognizable to the audience?
- Is the full hour available for speaking, or does the organizer require a longer Q&A?
- Which ISO standard and which implemented selfassess.id/AMS workflows should be shown?
- Which Kemenkeu AI Audit materials, methodological domains, and examples can be shared publicly?
- Should Part II emphasize internal use of AI, externally facing AI services, or autonomous agents?
- Which claim or provocative question should the audience remember a week later?

**Recommended next step:** agree on the recurring case and main audience, translate the supplied AI Audit material into a concise story and interactive scenario, and script the deck-to-demo transitions before building the seminar website.

## 12. Website delivery: HTML deck and demonstrations in one place

### 12.1 Intended experience

The website is the seminar's presentation surface. The presenter opens the HTML deck, moves into the relevant app demonstration, and returns to the exact point in the narrative. Participants can revisit the deck, demonstrations, and supporting references through the same domain after the session.

Suggested site structure; paths are provisional:

| Location | Purpose |
|---|---|
| `/` | Seminar introduction and entry points to the deck and demo app |
| `/deck` | HTML presentation with the two seminar pillars |
| `/demo` | App workspace with the recurring case and saved scenario state |
| `/demo/risk-identification` | Internal context, external signals, proposed risks, human review |
| `/demo/risk-assessment` | New evidence, reassessment, response decision |
| `/demo/continuous-assurance` | Monitoring signals and their connection to risk and assurance work |
| `/demo/project-assurance` | selfassess.id and AMS demonstration entry points |
| `/demo/ai-audit` | Interactive walkthrough using the shareable Kemenkeu AI Audit methodology |
| `/resources` | References, shareable materials, and optional deck download |

These can be sections of one app rather than separate applications. Existing selfassess.id or AMS deployments may need integration or a purpose-built demonstration view to appear within this website. Decide that from their actual architecture and permitted access; do not assume they can simply be embedded.

### 12.2 HTML deck requirements

- Fullscreen presentation mode, keyboard navigation, readable typography, and clear progress through the two pillars.
- A direct link for each slide or section so the presenter can resume quickly.
- A prominent “Open demonstration” action on the relevant slide, with “Return to presentation” restoring the prior slide.
- Presenter notes kept out of the audience view.
- Responsive reading mode for participants revisiting the material on phones or laptops.
- Shareable source references near the relevant content.
- A print-friendly or downloadable version as a fallback and takeaway.

### 12.3 Demonstration app requirements

- Carry the same organizational objective, risk entries, source evidence, and monitoring signals across the scenarios.
- Make the before-and-after assessment and human decision visible.
- Provide preloaded scenarios, a reset action, and saved checkpoints so the live sequence is reliable.
- Label live AI results, prerecorded results, and simulated behavior clearly.
- Show the AI Audit method through criteria, evidence, testing, findings, and management action using approved material.
- Keep public participant sessions separate from the presenter's scenario state.
- Keep service credentials on the server if live AI calls are enabled; define access and usage limits before public release.

### 12.4 Website storyboard and rehearsal

Rehearse this single route through the website:

> HTML opening → risk identification demo → deck explanation → reassessment demo → CMCA/project assurance walkthrough → deck transition → Kemenkeu AI Audit method → AI Audit demonstration → closing and Q&A.

Use a QR code or short domain link for participant access once the actual address is chosen. Preload assets and maintain local or downloadable fallback material. Measure the transitions during rehearsal so navigation stays within the existing 60-minute agenda.

### 12.5 Build and hosting decisions for later

- Domain and preferred seminar path or subdomain.
- A dedicated seminar app versus integration into an existing website.
- Live AI, simulated scenarios, or a hybrid demonstration mode.
- Integration approach for selfassess.id and AMS.
- Public versus restricted AI Audit material and demonstration access.
- Hosting requirements once the app's server-side needs are known.

The current deliverable remains the material plan. Website implementation and deployment are subsequent steps.

## 13. Source-grounded Part II and app design

### 13.1 Source map

Primary material: [03 - Alat dan Teknik Audit AI.pdf](../sources/03%20-%20Alat%20dan%20Teknik%20Audit%20AI.pdf), 128 pages, authored by Teuku Raja Irfan Radarma. Page references below refer to PDF pages, counted from one.

| Pages | Material | Use in the seminar |
|---|---|---|
| 20, 57–59 | Oversight architecture and principles | Main Part II diagram; awareness before compliance, proportionality, continuous improvement |
| 61–70 | Adapted OECD classification and characteristic mappings | Interactive system profile and inherent-risk discussion |
| 71–73 | SIPER classification example | Optional contrast with a generative assistant |
| 75–79 | Control mappings and consolidation | Explain control gaps, residual-risk profiles, and selective audit focus |
| 81–109 | Audit guidance, lifecycle risks, procedures, and evidence | Drill from a priority characteristic to a selected lifecycle test |
| 111–116 | Advanced testing techniques | Select a technique that answers the assurance question; avoid a tool catalogue |
| 118–124 | Kemenkeu chatbot case | Evidence-led case narrative and lessons; prepare a synthetic public demonstration |

The material explicitly connects adapted OECD classification, ISO/IEC 42001 controls, NIST trustworthiness characteristics, CRISP-DM lifecycle stages, and the ISACA AI Audit Toolkit (page 20). This relationship can now be explained from the source rather than treated as an assumed mapping.

### 13.2 Main narrative for the second pillar

> Understand the system → identify inherent exposure → evaluate controls → establish residual-risk priorities → select proportionate audit tests → substantiate findings → recommend and monitor improvement.

Use the source's seven characteristics: Safe; Secure & Resilient; Explainable & Interpretable; Privacy-Enhanced; Fair; Valid & Reliable; Accountable & Transparent.

Explain that assessment can itself support improvement without automatically leading to an audit. Significant residual exposure helps justify focused substantive testing (page 79).

The source describes 47 lifecycle risks and 50 audit testing statements in the guidance (page 81). Show one meaningful chain from risk to procedure to evidence rather than attempt to cover the full catalogue in this seminar.

### 13.3 Revised nine-minute methodology segment

- **2 minutes:** why ordinary functional testing is insufficient for AI; introduce the source's oversight principles.
- **3 minutes:** demonstrate classification and the resulting inherent-risk profile across the seven characteristics.
- **2 minutes:** show control gaps and how they inform residual-risk judgment and audit focus.
- **2 minutes:** select one lifecycle audit procedure and its evidence requirements.

Follow with the existing eight-minute case/testing segment. Keep international framework background in optional website resources.

### 13.4 AI Audit demonstration app

Build a guided workspace within `/demo/ai-audit`:

1. **System profile:** choose economic context, affected users, data source, collection mode, personal-data use, model approach, infrastructure, and output type using the adapted classification in page 62.
2. **Inherent exposure:** show the seven-characteristic profile and the rationale behind each proposed rating. Allow human review and adjustments with reasons.
3. **Control assessment:** inspect a small selected set of controls, supporting evidence, and identified gaps. Missing evidence should remain visible as uncertainty.
4. **Audit priorities:** display inherent exposure and control gaps side by side, with a reasoned residual-risk judgment and suggested focus areas.
5. **Audit workbench:** choose a relevant lifecycle procedure and inspect documents, interview evidence, or a controlled output test.
6. **Finding and action:** connect criterion, condition, supporting evidence, consequence, substantiated cause or unresolved hypothesis, recommendation, owner, and follow-up.

The app should make mappings and reasons inspectable. It must not invent a numeric residual-risk formula or present automatic ratings as validated methodology. Reproduce confirmed source mappings; label any added demonstration rules and retain professional judgment.

Useful interaction: compare a limited internal generative assistant with a system influencing decisions about external individuals. Let participants see why context changes audit attention, rather than imply that all internal systems have low privacy, fairness, or safety exposure.

### 13.5 Case lesson to carry into the deck

The chatbot case separates functioning technical safeguards from weaknesses in governance and output reliability (pages 121–124). A system can have security controls and still lack adequate evidence that its answers are dependable and its responsibilities are clear.

Use a synthetic knowledge base containing current, withdrawn, and access-restricted documents. Demonstrate how retrieval quality, output testing, governance evidence, and logging affect the assurance conclusion. Preserve the source's distinction between observed evidence, testing scope, and wider conclusions.

### 13.6 Source reconciliation before implementation

- Page 58 describes the guidance as a study/technical framework not yet enacted as a formal Per/Kep. Page 81 describes issuance through an Inspector VII memorandum. Present these distinctions accurately; confirm any subsequent status changes with the presenter.
- Some ISO control identifiers differ between the mapping tables and case summary. Reconcile them before building a control catalogue; retain the source label separately from any verified standard reference.
- Verify quantitative claims, regulatory timelines, and broad technical assertions if selected for the final deck. They are not needed for the central methodological story.
- Treat case-specific risk conclusions as judgments for that case, not universal rules about internal users, identifiers, cloud hosting, or generative AI.
- Prepare public examples from synthetic data; determine which original case details and source material are intended for publication before including them in the hosted website.

### 13.7 Delivery commitment and quality targets

The intended work includes both the complete HTML deck and the functioning demonstration app, followed by integration and rehearsal on the same website. The Markdown plan is their content and scope foundation.

Completion should include a coherent 60-minute narrative, accurate source mappings, implemented scenario interactions, reliable deck-to-demo return navigation, visual review at presentation and mobile sizes, functional checks of scenario state and reset behavior, and a timed rehearsal with fallback material. Hosting on the chosen domain follows when deployment details are supplied.

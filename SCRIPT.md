# Talk Script — Rethinking Safe Interpretable AI from First-Principles

GDE Summit · Google Cloud Next 2026 · Taha Bouhsine

31 slides total. Two delivery modes:
- **10-MINUTE MODE** — dwell on 13 slides, flash through 17 as visual punctuation
- **FULL SCRIPT** — ~29 minutes, every slide narrated in full

Flash slides are marked in the deck with `data-pace="flash"` — a small amber badge appears in the top-right corner so you (the speaker) can see at a glance "keep moving."

---

## 10-MINUTE MODE — Dwell + Flash pacing

The deck looks comprehensive (30 slides), but in a 10-min slot you only *stop* on the 13 that carry the story. The rest become visual punctuation — you click through with a one-liner.

**Key technique:** for flash slides, start the one-liner *as you click*, not after. Your voice should be mid-sentence when the new slide appears. This creates pace.

### DWELL slides — spend time (~9 min)

| # | Slide | Time | Why dwell |
|---|-------|------|-----------|
| 1 | Title | 15s | Opening beat |
| 3 | The Aether (belief) | 45s | The hook — physics analogy |
| 5 | Patch or Remove | 40s | The aha ("what if we don't need it?") |
| 7 | Transformer Anatomy | 50s | The AI parallel — where's the aether? |
| 8 | Manifold Distortion | 40s | The "opposite → orthogonal" visual punch |
| 12 | **Yat-Product** | 75s | The main idea — must dwell |
| 13 | Where Yat Goes | 40s | "This is what it replaces" |
| 14 | Results | 50s | The proof (GPT-2 + CLIP) |
| 15 | **Does it Scale?** | 50s | The de-risking moment (1B model) |
| 16 | What Kernel Theory Brings | 35s | The setup for "four pillars" |
| 17 | SLAY | 60s | Killer bonus result |
| 27 | **Vision / Azetta.ai** | 40s | The close |
| 30 | Thank You | 15s | Out |

**Subtotal:** ~555s = **9.25 min**

### FLASH slides — click through (~2 min)

Flash-slide cue (amber "▸ FLASH" badge top-right) reminds you to keep moving. Wave at these with a one-liner, no deep dive.

| # | Slide | One-liner |
|---|-------|-----------|
| 2 | About Me | *(walking on)* "Quick intro — GDE, Azetta.ai, researcher." — **5s** |
| 4 | Michelson–Morley | "They ran the experiment. Null result. The aether wasn't there." — **12s** |
| 6 | The Lesson | *(pause on quote)* "When the foundation is wrong, no amount of patching helps." — **5s** |
| 9 | Depth Degradation | "And it compounds every layer. By layer 64, signal is gone." — **10s** |
| 10 | Inverse-Square Law | "Physics uses 1/r². Locality is a law, not a heuristic." — **10s** |
| 11 | Back to Mercer | "Mercer showed every kernel defines a geometry. We're going to use that." — **10s** |
| 18 | Quantization | *(show and keep going)* "Oh, and by the way — Yat INT8 beats GELU FP32 at 4× less memory." — **8s** |
| 19 | Concept Editing | "And you can edit concepts directly because neurons are monosemantic." — **8s** |
| 20 | OOD Detection | "And you get out-of-distribution detection for free." — **8s** |
| 21 | Security | "And because it's interpretable, we had to add a security protocol. Worth a longer talk." — **10s** |
| 22 | Cost Problem | "Indie researcher, Morocco, every GPU hour counts." — **6s** |
| 23 | Constraints | "Reproducibility, no CUDA hell, hardware you can afford." — **6s** |
| 24 | JAX | "JAX thinks like a mathematician. `pip install nmn`, open source." — **8s** |
| 25 | Ecosystem | "Colab, Kaggle, TRC, TPU Sprint — this is how it got built." — **8s** |
| 26 | Proofs First | "The hardest part was the proofs, not the experiments. Math guided us." — **8s** |
| 28 | **The Ask** | "If any of this resonates — try it, partner with us, build with us. Email's on screen." — **15s** |
| 29 | Special Thanks | *(photo up while speaking)* "Thanks to Soonson, Hee, Nari, Bitnoori and the whole community." — **10s** |
| 31 | References | *(only if asked)* "Full bibliography here." — **3s** |

**Subtotal:** ~150s = **~2.5 min**

### Total: ~11.75 min — trim ~1.75 min during rehearsal.

**Rehearsal tip:** time yourself on the dwell slides. If you're running hot, tighten the aether section (slides 3–7) — it's the most compressible. Don't cut the 1B scaling beat (slide 15) — that's load-bearing for credibility.

---

## FULL SCRIPT — ~29 minutes

For a longer slot. Every slide narrated in full with transitions baked in.

### Slide 1 — Title (30s)

> "Good [morning/afternoon], everyone. Today I want to tell you a story — and by the end of it, I want you to see deep learning differently than when you walked in. The story starts with physics, but it ends with a very practical question: can we build AI that's both state-of-the-art *and* understandable? My name is Taha Bouhsine. Let's get into it."

*Transition:* "But first — who am I, and why am I on this stage?"

### Slide 2 — About Me (30s)

> "I'm a Google Developer Expert for AI/ML, focused on JAX and Flax. I'm also the CEO and research scientist at Azetta.ai, an interpretability-first startup. And I founded MLNomads, a research community. My research lives at the intersection of kernel theory, geometric interpretability, white-box deep learning, and physics-grounded architectures."

*Transition:* "That last one — 'physics-grounded' — is where this talk really begins. Let me take you back about 135 years."

### Slide 3 — The Aether: The Belief (60s)

> "Meet Aristotle and Christiaan Huygens. Aristotle proposed a fifth element — the quintessence — 2,300 years ago. Huygens, in 1690, turned that philosophical idea into hard physics. He said: sound needs air. Ocean waves need water. So light must need *something* too. That something was the luminiferous aether — an invisible, all-pervading medium that filled the universe. For over a century, every optics equation assumed it. Every physicist believed it. It was never observed. Never measured. But it *had* to exist — because the math didn't work without it."

*Transition:* "Then, in 1887, someone decided to actually test it."

### Slide 4 — Michelson–Morley (45s)

> "Michelson and Morley built the most precise interferometer ever made. If Earth moves through the aether, light moving *with* that motion should be slightly faster than light moving *across* it. They split a beam, sent the halves perpendicular, recombined them, looked for a fringe shift. This was the expected curve. This is what they measured — essentially flat. The most famous null result in physics."

*Transition:* "The aether wasn't there. So what did physicists do?"

### Slide 5 — Patch or Remove (50s)

> "For the next 18 years, brilliant people — Lorentz, Fitzgerald — proposed increasingly complex patches. 'Maybe the aether contracts objects.' 'Maybe it gets dragged along.' Adding complexity to save a broken foundation. Sound familiar? Then, in 1905, Einstein did something different. He didn't patch the aether. He asked: *what if there is no aether?* Start from what we can observe — the speed of light is constant — and rebuild from there. Special relativity. From first principles."

*Transition:* "Einstein's move teaches a lesson that applies far beyond physics."

### Slide 6 — The Lesson (25s)

> "When the foundation is wrong, no amount of patching helps. The aether was an *unexamined assumption* that became invisible through repetition. Until someone asked the simplest question: *what if we just… don't need it?*"

*Transition:* "Hold that question. Because I'm about to argue that deep learning has its own aether."

### Slide 7 — Transformer Anatomy (60s)

> "Look inside a Transformer. Attention has a clear mathematical framework for interpretability — we can decompose it into circuits, trace information flow. Anthropic published a beautiful paper on this in 2021. But attention is only *one* block. Right after it comes the MLP. Two linear projections sandwiching an activation function — sigma. The linear parts are interpretable. But sigma breaks the chain. No closed-form inverse, no geometric meaning, no mathematical structure to decompose. And this repeats every layer."

*Transition:* "What does that non-linearity actually do to the data?"

### Slide 8 — Manifold Distortion (50s)

> "A unit circle in 2D. 20 points, opposite pairs connected — 180° apart, maximally different meanings. This is the geometry we start with. Apply ReLU — `max(0, x), max(0, y)`. Three quadrants collapse. Points that were diametrically opposite now overlap at the origin. Mathematically, 'opposite' just became 'unrelated.' The metric structure is destroyed. And this is the *first* layer."

*Transition:* "And then you stack 96 of these on top of each other."

### Slide 9 — Depth Degradation (50s)

> "A clean sine wave on the left. Each step is another ReLU pass. By 64 passes, the signal is unrecognizable. Distortions *compound*. And here's the admission nobody in interpretability talks about enough: even Sparse Autoencoders — the best mechanistic interpretability tool — explicitly state they cannot *mathematically* explain what these layers compute. Statistical correlations. Not causal structure. The problem isn't that we need better probes. The problem is that the activations have no mathematical structure to probe."

*Transition:* "So if activations are the aether of AI, what do we replace them with? Let's look at how the rest of the universe works."

### Slide 10 — The Inverse-Square Law (45s)

> "When physicists removed the aether, the actual laws remained. Gravity, electrostatics, radiation — the universe runs on one pattern. `F proportional to 1 over r squared`. Influence decays with the square of distance. **Locality is the physics.** Not a heuristic, not a regularization trick — a law. Three masses here partition space not by magnitude, but by *proximity*. What if a neural operation's denominator encoded proximity, like gravity does?"

*Transition:* "To answer that, we go back to 1909."

### Slide 11 — Back to Mercer (55s)

> "In standard deep learning, input and weight space are linked by the dot product — a flat metric. James Mercer, in 1909, proved something richer. Every continuous positive-definite kernel implicitly maps data into a reproducing kernel Hilbert space — an RKHS — where geometry is *defined by the kernel itself*. Input space, two interleaved rings, not linearly separable. Apply the kernel map phi, and in RKHS they become separable. This is the trick we abandoned for scale. I'm here to tell you we can have both."

*Transition:* "And the specific kernel that gives us both is this."

### Slide 12 — The Yat-Product (80s)

> "The Yat-product. ⵟ, from the Tifinagh alphabet — a nod to my Amazigh heritage. Look at its structure. Numerator — `w dot x plus b` squared — measures *alignment*. Directional agreement, scaled by magnitudes. A squared cosine. Denominator — Euclidean distance between `w` and `x` — measures *proximity*. Inverse-square, just like gravity. This single formula is a valid Mercer kernel. Analytic. Lipschitz. And — the most beautiful part — *self-regularizing*. Non-linearity and normalization, in one kernel. On the right you see the potential well it creates — level sets around a weight vector, exactly like a gravitational field. This is what we mean by physics-grounded AI."

*Transition:* "So where does this kernel go, practically, in a real architecture?"

### Slide 13 — Where Yat Goes (45s)

> "Standard MLP block. Linear. Activation. Linear. LayerNorm. The activation destroys geometry, the normalization patches the damage. Yat version. Input, ⵟ-kernel, linear. The kernel handles both non-linearity *and* normalization — normalization is literally built into its denominator. No activation. No LayerNorm. No patches. Same expressive power, without the black box."

*Transition:* "Now — does this actually work?"

### Slide 14 — Results (60s)

> "Receipts. GPT-2, 261 million parameters, trained on 5.2 billion tokens of C4. Yat achieves 39.5 Wiki perplexity; GELU gets 46.5 — a 15% improvement. Wins 8 of 9 downstream benchmarks. Only 8% throughput hit. On CLIP image classification, matches GELU accuracy exactly, but stays stable across a 33× wider learning rate band. These are trained models, not theoretical claims."

*Transition:* "But the real question everyone in this room is asking is — does it scale?"

### Slide 15 — Does it Scale? (60s)

> "We pushed it to 1.08 billion parameters. Same optimizer. Same schedule. Same everything — except the kernel. Training loss gap? Zero point zero one four nats. Within noise of GELU. No exotic tricks. No instability. The kernel does not fall apart at scale. It just works. This is the de-risking moment. Everything else rests on this."

*Transition:* "And the story doesn't stop at performance. When you build on a principled kernel, you get things you *can't* get with arbitrary activation functions."

### Slide 16 — What Kernel Theory Brings (50s)

> "Zoom out. A principled kernel unlocks four things — one slide each. **Scaling** — random-feature approximation turns quadratic kernel operations into linear time. **Interpretability** — monosemantic neurons by design. **Efficiency** — quantization-robust by structure. **Safety** — OOD detection for free. Let's walk through each."

*Transition:* "First — scaling."

### Slide 17 — SLAY (60s)

> "SLAY. Spherical Linearized Attention with Yat-Kernel. Constrain Q, K to the unit sphere — similarity becomes purely angular. Replace softmax with the ⵟ-kernel. Apply Bernstein's theorem — the kernel decomposes exactly into a positive integral. Discretize with Gauss-Laguerre quadrature. You get a finite feature map Psi. Plug into attention — and quadratic attention becomes *linear*. No approximation. Mathematical identity. O(n) time, 16K tokens stable, 2-8× speedup at 1K-4K tokens. Standard attention runs out of memory at 8K."

*Transition:* "Second pillar — efficiency."

### Slide 18 — Quantization (55s)

> "In the Yat-kernel, weights appear in *both* numerator and denominator. When you quantize, rounding errors partially cancel. Standard activations don't have this structure. GELU at INT8 adds 10.83 perplexity. Yat at INT8 adds only 5.12 — 42% less degradation. The kicker: Yat INT8 — at 44.65 perplexity — actually *beats* GELU FP32 — at 46.52 — while using 4× less memory. Not a tradeoff. Free lunch."

*Transition:* "Third pillar — interpretability."

### Slide 19 — Concept Editing (55s)

> "Each neuron corresponds to a concept in the RKHS. You can *edit the model directly*. No fine-tuning. No retraining. Just locate the neuron and rewrite it. Glass-box network: four input tokens — 'The', 'capital', 'of', 'France' — flowing through labeled concept neurons to 'Paris'. 'Capital City' neuron highlighted — we can edit it surgically. Monosemantic by design. Not discovered by probing *after* the fact. Built in by the kernel."

*Transition:* "Fourth pillar — safety."

### Slide 20 — OOD Detection (45s)

> "The Yat-kernel literally *is* a distance. The highest kernel activation across prototypes — `s(x) equals max over j of K of w_j and x` — is a natural confidence score. Far from any prototype? Low score. On shifted inputs at sigma equals 3, Yat score hits AUROC 1.00. Softmax entropy? 0.60 — essentially random. Zero extra training. Zero extra heads. One forward pass."

*Transition:* "Which brings us to the caveat."

### Slide 21 — Security (60s)

> "If every neuron is a concept, the weights *themselves* leak information — potentially including training data. A glass box is transparent to everyone. Including people who shouldn't see inside. Interpretability without access control isn't safety. It's exposure. So at Azetta we're building a Model Security Protocol. Cryptographic access control. Weight encryption. Verifiable inference — users verify the model ran correctly *without* revealing its weights. Zero-knowledge glass box."

*Transition:* "So — how did we build all this? It wasn't obvious, and it wasn't cheap."

### Slide 22 — The Cost Problem (45s)

> "GPUs are expensive. Running random experiments would cost a small nation's GDP. If you're an indie researcher from the outskirts of Morocco — like me — every GPU hour counts. You can't brute-force discovery. Every experiment has to be intentional."

*Transition:* "Here's what you actually need."

### Slide 23 — The Constraints (45s)

> "Three constraints. *Reproducibility* — you need to know you're not winning a lottery ticket. *No CUDA hell* — you don't want to spend months writing kernels just to test a math hypothesis. *Hardware access* — accelerators you can actually afford. H100 clusters are not an option."

*Transition:* "This is where JAX comes in."

### Slide 24 — JAX & Flax (75s)

> "JAX thinks like a mathematician. `jax.grad` gives autodiff through the ⵟ-kernel for free. `jax.vmap` vectorizes without loops. `jax.jit` compiles Python to XLA, runs on TPU. `jax.pallas` lets us write custom fused kernels when XLA isn't enough — hand-tuned performance, pure Python. `flax.nnx` gives us a Pythonic module system. The code is the punchline. Standard MLP: Linear, gelu, Linear. NMN: YatNMN, Linear. `pip install nmn` — open source, you can use it today."

*Transition:* "Good tools need compute."

### Slide 25 — The Ecosystem (60s)

> "Colab and Kaggle TPUs for prototyping. Google Cloud TPUs — v4, v5, v6 — for real experiments, and because of JAX and XLA, the same code ran across generations without changes. TRC — TPU Research Cloud — Google's research support program. TPU access that made both papers possible. And during the TPU Sprint organized by Soonson's team at the Google AI Developer Program, we used flaxchat, our JAX/Flax training framework."

*Transition:* "One more honest thing."

### Slide 26 — Proofs First (60s)

> "The hardest part wasn't compute. It wasn't engineering. It was the months spent at the whiteboard proving the theorems. Without proofs: random experiments, hoping for a good loss curve, burning compute on intuition. With proofs: the theorem tells you what should work and why. Experiments become validation, not exploration. Once we proved the ⵟ-kernel was a valid Mercer kernel, the experiments followed directly. The math told us what to test."

*Transition:* "Which brings us back to the beginning."

### Slide 27 — Vision / Azetta.ai (60s)

> "Azetta.ai. An AI interpretability-first startup. Building state-of-the-art AI that is interpretable, steerable, and efficient. Glass box, not black box. One neuron, one concept. Correct behavior without retraining. Fewer parameters, faster training. The mission is simple: AI should be safe, transparent, and sustainable. Every decision explainable. Every behavior correctable."

*Transition:* "Which brings me to what I'm asking from this room."

### Slide 28 — The Ask (50s)

> "Three ways to engage. **Try it** — `pip install nmn`, swap one activation in your next experiment, tell us what broke and what didn't. Ten minutes of your time. **Partner with us** — if you're running production ML in a regulated industry, or an academic lab that wants to co-author on this, let's talk. **Build with us** — if your organization needs interpretable AI as infrastructure, or if you're investing in research that rewrites the foundations: we're raising, and we want strategic partners, not just capital. Email on screen. Come find me after. We'll build this together or not at all."

*Transition:* "None of this happened alone."

### Slide 29 — Special Thanks (40s)

> "Thank you to the Google AI Developer Program. This research wouldn't exist without the Google Developer Expert community, the TPU Research Cloud, and every person in this picture — at the AI Community Summit in Bali. Personal thanks to Soonson Kwon, Hee Jung, Nari Yoon, and Bitnoori Keum for believing in first-principles research from day one."

*Transition:* "And with that —"

### Slide 30 — Thank You / Q&A (20s)

> "Thank you. Let's remove the aether from AI. Papers on arXiv, code on GitHub, everything open. I'd love your questions."

### Slide 31 — Bibliography (if shown, 10s)

> "All the papers cited, for your reference."

---

## Delivery notes

### Pacing anchors
Three big dwell moments: **slide 12 (Yat-Product formula)**, **slide 15 (1B scaling result)**, **slide 17 (SLAY O(n))**. Slow down on those.

Breathing points:
- After slide 6 (aether lesson) — let the analogy land
- After slide 15 (does it scale) — let the number sink in
- After slide 21 (close of four pillars) — transition from "what it is" to "how we built it"

### Repeated phrases (lean on these for memorability)
- "From first principles"
- "Glass box, not black box"
- "The aether of AI"
- "It just works"

### Story rhythm
Physics story → AI problem → Math solution → Proof it works → Does it scale → Four pillars → The journey → Vision.

Three big reveals: aether analogy (slide 3), Yat-product (slide 12), 1B scaling (slide 15).

### Narration style
Contractions OK. Short sentences land better than long ones. Don't read the slide — expand beyond it. The slide is the anchor; your voice tells the story.

### Flash-slide cue
When you're on a flash slide, a small amber "▸ FLASH" badge appears top-right. Audience won't notice it. You'll see it in your peripheral and know to keep moving.

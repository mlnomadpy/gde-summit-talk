# Flash Edition — 10-minute Script

**Rethinking Safe Interpretable AI from First-Principles**
GDE Summit · Google Cloud Next 2026 · Taha Bouhsine

31 slides total. You dwell on 13 slides and flash through 18. A small amber **`▸ FLASH`** badge appears top-right when the active slide is a flash — audience won't notice, you'll see it in your peripheral.

**Key technique:** for flash slides, start the one-liner *as you click*, not after. Your voice should be mid-sentence when the new slide appears. This creates pace.

---

## DWELL slides — spend time (~9.25 min)

### Slide 1 — Title (15s)
Welcome. Today I want to tell you a story — starts with physics, ends with a very practical question: can we build AI that's both state-of-the-art *and* understandable?

### Slide 3 — The Aether (45s)
Meet Aristotle and Huygens. 2,300 years ago Aristotle proposed a fifth element. In 1690 Huygens turned it into physics — sound needs air, ocean waves need water, so light must need *something* too. That something was the luminiferous aether. For over a century, every optics equation assumed it. Never observed. Never measured. But it *had* to exist — because the math didn't work without it.

### Slide 5 — Patch or Remove (40s)
For 18 years after Michelson-Morley, brilliant people proposed increasingly complex patches to save the aether. Lorentz contraction, Fitzgerald hypothesis. Then in 1905 Einstein did something different. He didn't fix the aether. He asked: *what if there is no aether?* Build from what we can actually observe. Special relativity. From first principles. **When the foundation is wrong, no amount of patching helps.**

### Slide 7 — Transformer Anatomy (50s)
Deep learning has its own aether. Look inside a Transformer. Attention has a clear mathematical framework — we can decompose it into circuits. But the MLP is different. Two linear projections sandwiching an activation function, sigma. The linear parts are interpretable. Sigma breaks the chain. No closed-form inverse, no geometric meaning, no mathematical structure to decompose. And it repeats every layer.

### Slide 8 — Manifold Distortion (40s)
20 points on a unit circle. Opposite pairs — 180° apart, maximally different meanings. Apply ReLU: three quadrants collapse. Points that were diametrically opposite now overlap at the origin. Mathematically, 'opposite' just became 'unrelated.' The geometry of meaning is destroyed. **This is the first layer.**

### Slide 12 — Yat-Product (75s) **← main idea**
The Yat-product. ⵟ, from Tifinagh — my Amazigh heritage. Numerator: `w dot x plus b` squared — *alignment*, a squared cosine. Denominator: Euclidean distance — *proximity*, inverse-square, just like gravity. This single formula is a valid Mercer kernel. Analytic. Lipschitz. *Self-regularizing*. Non-linearity and normalization, in one kernel. On the right, the potential well — level sets around a weight vector, exactly like a gravitational field. Physics-grounded AI.

### Slide 13 — Where Yat Goes (40s)
Standard MLP: Linear, activation, Linear, LayerNorm. Activation destroys geometry; normalization patches the damage. Yat version: Input, ⵟ-kernel, Linear. The kernel handles both. No activation. No LayerNorm. No patches. Same expressive power, without the black box.

### Slide 14 — Results (50s)
GPT-2, 261M parameters, C4, 5.2B tokens. Yat: 39.5 Wiki perplexity. GELU: 46.5. That's 15% better. Wins 8 of 9 benchmarks. 8% throughput hit. On CLIP image classification — matches GELU accuracy exactly, stable across a 33× wider learning rate band.

### Slide 15 — Does it Scale? (50s) **← de-risking moment**
The real question: does it scale? We pushed it to 1.08 billion parameters. Same optimizer, same schedule, same everything — except the kernel. Training loss gap? 0.014 nats. Within noise of GELU. No exotic tricks. No instability. **The kernel does not fall apart at scale. It just works.**

### Slide 16 — What Kernel Theory Brings (35s)
A principled kernel unlocks four things. **Scaling** — linear-time attention. **Interpretability** — monosemantic neurons by design. **Efficiency** — quantization-robust by structure. **Safety** — OOD detection for free. Four slides, one each.

### Slide 17 — SLAY (60s)
SLAY. Constrain Q, K to the unit sphere — similarity becomes purely angular. Replace softmax with the ⵟ-kernel. Apply Bernstein's theorem — the kernel decomposes exactly. Discretize with Gauss-Laguerre. You get a finite feature map. Plug into attention — and quadratic becomes *linear*. No approximation. Mathematical identity. O(n) time. 16K tokens stable. 2-8× speedup.

### Slide 27 — Vision / Azetta.ai (40s) **← the close**
Azetta.ai. An AI interpretability-first startup. Building AI that is interpretable, steerable, and efficient. Glass box, not black box. One neuron, one concept. AI should be safe, transparent, and sustainable. Every decision explainable. Every behavior correctable.

### Slide 30 — Thank You (15s)
Thank you. Let's remove the aether from AI. Papers on arXiv, code on GitHub. I'd love your questions.

**Dwell subtotal:** ~555s = **9.25 min**

---

## FLASH slides — click through (~2.5 min)

| # | Slide | One-liner (say *as* you click) | Time |
|---|-------|--------------------------------|------|
| 2 | About Me | *(walking on)* "Quick intro — GDE, Azetta.ai, researcher." | 5s |
| 4 | Michelson–Morley | "They ran the experiment. Null result. The aether wasn't there." | 12s |
| 6 | The Lesson | *(pause on quote)* "When the foundation is wrong, no amount of patching helps." | 5s |
| 9 | Depth Degradation | "And it compounds every layer. By layer 64, signal is gone." | 10s |
| 10 | Inverse-Square Law | "Physics uses 1/r². Locality is a law, not a heuristic." | 10s |
| 11 | Back to Mercer | "Mercer showed every kernel defines a geometry. We're going to use that." | 10s |
| 18 | Quantization | "Oh, and by the way — Yat INT8 beats GELU FP32 at 4× less memory." | 8s |
| 19 | Concept Editing | "And you can edit concepts directly — monosemantic by design." | 8s |
| 20 | OOD Detection | "And you get out-of-distribution detection for free." | 8s |
| 21 | Security | "And because it's interpretable, we had to add a security protocol." | 10s |
| 22 | Cost Problem | "Indie researcher, Morocco, every GPU hour counts." | 6s |
| 23 | Constraints | "Reproducibility, no CUDA hell, hardware you can afford." | 6s |
| 24 | JAX | "JAX thinks like a mathematician. `pip install nmn`, open source." | 8s |
| 25 | Ecosystem | "Colab, Kaggle, TRC, TPU Sprint — this is how it got built." | 8s |
| 26 | Proofs First | "The hardest part was the proofs, not the experiments." | 8s |
| 28 | **The Ask** | "Three ways to engage. Try it, partner with us, build with us. Email's on screen." | 15s |
| 29 | Special Thanks | *(photo up)* "Thanks to Soonson, Hee, Nari, Bitnoori and the community." | 10s |
| 31 | References | *(only if asked)* "Full bibliography here." | 3s |

**Flash subtotal:** ~150s = **2.5 min**

---

## Total: ~11.75 min

**To hit a hard 10:**
- Slide 3 (Aether belief): 45s → 35s. Drop "never observed, never measured."
- Slide 7 (Transformer): 50s → 40s. Skip the Anthropic reference.
- Slide 14 (Results): 50s → 40s. One benchmark only (GPT-2) — make CLIP a bullet.
- Tighten transitions between flash slides (no pause).

Saves ~1.75 min → lands at ~10.

---

## Pacing anchors

Three big dwell moments — slow down on these:
- **Slide 12 — Yat-Product** (the formula)
- **Slide 15 — 1B scaling result** (the de-risking)
- **Slide 17 — SLAY** (the O(n) reveal)

Breathing points (let the room process):
- After slide 6 (aether lesson) — the analogy lands
- After slide 15 (does it scale) — the number sinks in
- After slide 21 (close of four pillars) — transition to "how we built it"

## Phrases to repeat (memorability)

- "From first principles"
- "Glass box, not black box"
- "The aether of AI"
- "It just works"

## Three big reveals (the story's spine)

1. **Slide 3** — the aether analogy (the hook)
2. **Slide 12** — the Yat-product (the answer)
3. **Slide 15** — 1B scaling (the proof)

Everything else supports these three beats.

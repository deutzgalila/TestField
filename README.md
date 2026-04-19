# Deutz Cymar Galila — Software Orchestrator

> "The age of syntax fades; the era of the orchestrator begins. Embrace the shift, take up the baton, and conduct the future of code."

A high-performance, developer-centric portfolio designed for the 2026 web. This project is built with a focus on **Operational Empathy**, **Long-Term Thinking**, and **Technical Orchestration**.

## 🚀 Key Orchestration Features

- **High-Impact 3D Hero:** A custom Three.js particle force-field rendering off-main-thread via `OffscreenCanvas` in a Web Worker, ensuring 60fps even during heavy user interaction.
- **Native Scroll-Driven Animations:** Utilized the 2026 CSS `view-timeline` and `animation-timeline` APIs for smooth, performant entry reveals that automatically respect `prefers-reduced-motion`.
- **2026 Visual Design:** A minimalist, mobile-first layout with a semantic dark mode token system, frosted glassmorphism (`glass-card`), and restricted color palettes.
- **Advanced SEO & Discovery:** Includes JSON-LD structured data for Person/Software Orchestrator, Open Graph metadata, and performance budgeting via `11ms.txt`.
- **WCAG 2.2 Level AA Compliance:** Built for inclusion with skip-links, focus-visible rings, and full keyboard navigation.
- **Lighthouse Scoring:** Optimized for 90+ across all metrics through surgical asset and code management.

## 🛠 Tech Stack

- **Core:** Vanilla ES2026+, HTML5, CSS3
- **Graphics:** Three.js (via WebGL/WebGPU Fallback)
- **Concurrency:** Web Workers & `OffscreenCanvas`
- **Animations:** CSS Scroll-Driven Animations API
- **Fonts:** Inter (Preloaded)
- **Deployment:** Vercel

## 📂 Project Structure

- `index.html`: Semantic entry point & SEO metadata.
- `style.css`: Semantic design tokens & scroll-driven animations.
- `app.js`: Main thread orchestrator for events and worker lifecycle.
- `worker.js`: Background thread Three.js rendering engine.
- `vercel.json`: Deployment configuration & security headers.
- `11ms.txt`: Performance budgeting & domain verification.

## 📈 Performance Targets

| Metric | Target |
| :--- | :--- |
| **LCP** | < 1200ms |
| **FID** | < 100ms |
| **CLS** | < 0.1 |
| **Accessibility** | 100/100 |

## ⚖️ License

This project is licensed under the MIT License.

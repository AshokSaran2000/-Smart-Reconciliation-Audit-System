# UI Design Guide — Smart Reconciliation (Polished UI Kit)

This guide captures the visual system used in the frontend: colors, typography, spacing and key components.

1. Colors
- Primary: `#0d6efd` (calls to action, header)
- Accent: `#8e54ff` (gradients and highlights)
- Success: `#16a34a`
- Warn: `#f59e0b`
- Danger: `#ef4444`
- Background: `#f6f8ff`

2. Typography
- Font family: Inter (fallbacks included). Use 16px base.
- Weights: 700 (bold), 600 (semibold), 400 (regular).
- Headings: h1 34px, h2 28px, h3 24px, h4 20px — balance for metrics.

3. Spacing & Layout
- Baseline: 8px. Use multiples for padding and margins.
- Container max width: 1200–1280px. Centered with 16–24px gutters.

4. Components
- Header: full-width gradient, brand left, nav links and Upload CTA on the right.
- Filters: a lightweight card with select fields and "Apply Filters" button.
- Summary cards: compact cards with small label, big numeric value, optional icon/description.
- Charts: Recharts for Bar and Pie; use muted grid lines and single-color bars using primary color.
- Table: condensed rows, subtle borders, right-aligned actions, status badges with semantic colors.
- Timeline: vertical list with timestamp and a small card for changed values.

5. Accessibility
- Ensure contrast for primary text >= 4.5:1.
- Add aria-labels to filter selects, upload controls and charts for screen readers.

6. Usage
- Theme variables are in `src/styles/theme.css`; prefer utility classes and component-level classes.

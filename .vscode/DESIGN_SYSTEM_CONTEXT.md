# CTH EdTech - Frontend Design & Architecture Context

## Current Status
- **Marketing Homepage:** Completed (Exact replica of EcoLearn Africa mockup).
- **Next Steps:** Proceed to build the internal dashboards (Admin Dashboard, Student Dashboard, Instructor Dashboard) and the Login Page based on the provided mockups.

## Design System Overview
The application uses a unified design system implemented via native CSS custom properties in `src/app/globals.css` and a Tailwind CSS v4 setup.

### 1. Brand Colors
- **Primary (Institutional):** Navy Blue
  - `--cth-navy`: `#00153e`
  - `--cth-navy-container`: `#092962`
- **Secondary (Innovation/Action):** Teal
  - `--cth-teal`: `#006a6a`
  - `--cth-teal-container`: `#90efef`
- **Call-to-Action (High Impact):** Bright Yellow
  - `--cth-yellow`: `#f5d300`
- **Tertiary (SDG Accent):** Warm Brown/Rust
  - `--cth-rust`: `#2f0d00`

### 2. SDG Resource Chip Colors
- **Green (Policy/Agri):** `--sdg-green` (`#1b5936`), `--sdg-green-bg` (`#eaf3de`)
- **Blue (Engineering/Tech):** `--sdg-blue` (`#0c447c`), `--sdg-blue-bg` (`#e6f1fb`)
- **Orange (Strategy):** `--sdg-orange` (`#723615`), `--sdg-orange-bg` (`#ffdbcc`)
- **Amber (Quizzes/Alerts):** `--sdg-amber` (`#633806`), `--sdg-amber-bg` (`#faeeda`)

### 3. Typography & Spacing
- **Font:** Inter (via `next/font/google`).
- **Spacing Grid:** Uses a strict 4px baseline grid (`--space-xs`: 4px, `--space-md`: 16px, etc.). 
  - *Important Note:* We intentionally rely on standard Tailwind spacing for utilities (e.g. `max-w-md`) and avoid overriding the native `--spacing-*` variables in the `@theme inline` block of Tailwind v4, as this causes flexbox/width squishing issues.
- **Border Radius:** Default `8px` (`--radius`), Cards `12px` (`--radius-md`), Avatars/Pills `9999px`.
- **Shadows:** Uses custom navy-tinted shadows to match the premium aesthetic.

### 4. Custom UI Components (in `src/components/ui/`)
All base components have been refactored to use the CSS design tokens:
- **`button.tsx`**: Supports `primary` (Yellow), `secondary` (Teal), `outline` (Teal border), `ghost`, and `cta` variants.
- **`badge.tsx`**: Supports status pills and specific SDG color categorizations.
- **`card.tsx`**: Standardized Level 2 elevation shadows and `12px` border radius.
- **`input.tsx`**: Standardized focus states (Teal outline) and error states.

### 5. Layout & Sections to Retain
- **Marketing:** The `Header.tsx` and `Footer.tsx` match the exact EcoLearn Africa mockup. The `ClientPage.tsx` integrates the specific Hero, SDG, Pathways, and Testimonial sections. 
- **Legacy Components:** The old "Blog Insights" and "FAQ" sections have been integrated into the new homepage flow directly above the CTA banner.

// Design tokens — Arsenal Design System
// Using OKLCH for perceptually uniform colors

export const theme = {
  // ═══════════════════════════════════════════════════════════════════════
  // SURFACE HIERARCHY — Dark cinematic palette with purple tint
  // ═══════════════════════════════════════════════════════════════════════
  surface: {
    base:      'oklch(0.12 0.02 280)',   // #0d0d12 — Main background
    card:      'oklch(0.14 0.02 280)',   // #13131a — Cards / components
    elevated:  'oklch(0.17 0.02 280)',   // #1a1a24 — Hover / elevated
    overlay:   'oklch(0.10 0.02 280)',   // #08080c — Dark overlays
  },

  // ═══════════════════════════════════════════════════════════════════════
  // BORDERS — Subtle purple-tinted borders
  // ═══════════════════════════════════════════════════════════════════════
  border: {
    default:   'oklch(0.20 0.02 280)',   // #2a2a35 — Default borders
    subtle:    'oklch(0.17 0.02 280)',   // #1e1e2a — Subtle separators
    bright:    'oklch(0.28 0.02 280)',   // #3d3d4d — Active / focus borders
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TEXT — Cool-tinted whites
  // ═══════════════════════════════════════════════════════════════════════
  text: {
    primary:   'oklch(0.92 0.01 280)',   // #e8e8f0 — Primary text
    secondary:'oklch(0.55 0.02 280)',   // #8585a0 — Secondary / muted
    subtle:   'oklch(0.40 0.02 280)',   // #606075 — Tertiary / disabled
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ACCENT — Electric violet
  // ═══════════════════════════════════════════════════════════════════════
  accent: {
    default:   'oklch(0.65 0.18 290)',   // #8b5cf6 — Primary accent
    hover:     'oklch(0.70 0.20 290)',   // #a78bfa — Hover state
    muted:     'oklch(0.65 0.12 290 / 0.15)', // Transparent for backgrounds
    glow:      'oklch(0.65 0.18 290 / 0.25)', // For box-shadow glow
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SEMANTIC — Status colors (saturated for visibility)
  // ═══════════════════════════════════════════════════════════════════════
  semantic: {
    success:   'oklch(0.70 0.18 145)',   // #22c55e — Success green
    warning:   'oklch(0.75 0.18 85)',    // #f59e0b — Warning amber
    danger:    'oklch(0.65 0.22 25)',    // #ef4444 — Error red
    info:      'oklch(0.65 0.18 200)',   // #3b82f6 — Info blue
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RESOURCE TYPE COLORS — Distinctive colors for each content type
  // ═══════════════════════════════════════════════════════════════════════
  type: {
    video:   'oklch(0.62 0.22 25)',      // Coral / red for videos
    article: 'oklch(0.65 0.18 200)',     // Blue for articles
    tool:    'oklch(0.68 0.18 155)',     // Teal for tools
    repo:    'oklch(0.65 0.18 290)',     // Violet for repos
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════
  font: {
    sans: '"Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },

  // Font sizes (1.25 ratio scale)
  fontSize: {
    xs:    '0.75rem',      // 12px
    sm:    '0.875rem',     // 14px
    base:  '1rem',         // 16px
    lg:    '1.125rem',     // 18px
    xl:    '1.25rem',      // 20px
    '2xl': '1.5rem',       // 24px
    '3xl': '1.875rem',     // 30px
    '4xl': '2.25rem',      // 36px
  },

  // Font weights
  fontWeight: {
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SPACING — Base 4px
  // ═══════════════════════════════════════════════════════════════════════
  spacing: {
    0:  '0',
    1:  '0.25rem',   // 4px
    2:  '0.5rem',    // 8px
    3:  '0.75rem',   // 12px
    4:  '1rem',      // 16px
    5:  '1.25rem',   // 20px
    6:  '1.5rem',    // 24px
    8:  '2rem',      // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
  },

  // ═══════════════════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════════════════════════
  radius: {
    sm:  '6px',
    md:  '10px',
    lg:  '14px',
    xl:  '20px',
    '2xl': '28px',
    full: '9999px',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SHADOWS — Purple-tinted, no pure black
  // ═══════════════════════════════════════════════════════════════════════
  shadow: {
    sm:     '0 1px 2px oklch(0 0 0 / 0.3), 0 1px 3px oklch(0 0 0 / 0.2)',
    md:     '0 4px 6px oklch(0 0 0 / 0.25), 0 2px 4px oklch(0 0 0 / 0.2)',
    lg:     '0 10px 15px oklch(0 0 0 / 0.25), 0 4px 6px oklch(0 0 0 / 0.2)',
    glow:   '0 0 20px oklch(0.65 0.18 290 / 0.3)',
    glowSm: '0 0 10px oklch(0.65 0.18 290 / 0.2)',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MOTION — Custom easing curves
  // ═══════════════════════════════════════════════════════════════════════
  easing: {
    out:      'cubic-bezier(0.23, 1, 0.32, 1)',   // Responsive UI
    inOut:    'cubic-bezier(0.77, 0, 0.175, 1)',   // Smooth transitions
    drawer:   'cubic-bezier(0.32, 0.72, 0, 1)',    // iOS-like drawer
    bounce:   'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful bounce
  },

  // Duration scale
  duration: {
    fast:   '100ms',
    normal: '200ms',
    slow:   '300ms',
    slower: '400ms',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND UTILITIES — Pre-built class strings for common patterns
// ═══════════════════════════════════════════════════════════════════════════
export const classes = {
  // Cards
  card:        'bg-surface-card border border-border-default rounded-xl p-5',
  cardHover:   'hover:border-border-bright hover:shadow-glow transition-all duration-200',
  cardActive:  'data-[active=true]:border-accent data-[active=true]:shadow-glowSm',

  // Buttons
  button: 'px-5 py-2.5 bg-accent-default hover:bg-accent-hover text-white font-medium rounded-lg transition-all duration-150 active:scale-[0.97]',
  buttonSecondary: 'px-5 py-2.5 bg-surface-elevated hover:bg-surface-overlay border border-border-default text-text-primary font-medium rounded-lg transition-all duration-150 active:scale-[0.97]',
  buttonGhost: 'px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-all duration-150',

  // Inputs
  input: 'px-3 py-2.5 bg-surface-base border border-border-default rounded-lg text-text-primary placeholder-text-subtle focus:outline-none focus:border-accent-default focus:ring-2 focus:ring-accent-muted transition-all',
  inputError: 'border-danger-default focus:border-danger-default focus:ring-danger-muted',

  // Badges
  badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border',

  // Focus ring
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-default focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
} as const;
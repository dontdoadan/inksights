/**
 * INKSIGHTS Brand System v1
 * Machine-readable brand constants.
 *
 * Business authority:
 * Google Drive / INKSIGHTS / 06 Marketing & Brand / Brand System / 01 Canonical /
 * INKSIGHTS — Brand System — ACTIVE
 *
 * Do not redefine core identity values here without updating the canonical brand
 * authority and obtaining approval for material brand changes.
 */
export const INKSIGHTS_BRAND = {
  identity: {
    name: "INKSIGHTS",
    descriptor: "Growth Intelligence for UK Tattoo Studios",
    primaryLine: "Clearer data. Smarter decisions. Stronger studios.",
    campaignLine: "Real insights. Real growth.",
    finalLogoMarkApproved: false,
  },
  colour: {
    navy: {
      950: "#071525",
      900: "#0B1F3B",
      800: "#123455",
      700: "#19486E",
      600: "#245E88",
      500: "#35749C",
      400: "#5B91B2",
      300: "#89AFC7",
      200: "#B9CFDD",
      100: "#DDE8EF",
      50: "#F2F7FA",
    },
    mint: {
      950: "#063D34",
      900: "#07594A",
      800: "#087460",
      700: "#099076",
      600: "#11AD8D",
      500: "#2ED3A6",
      400: "#54E0B9",
      300: "#7EEACA",
      200: "#B2F2DE",
      100: "#D9F9EF",
      50: "#EEFCF8",
    },
    cleanWhite: "#F8FAFC",
    coolGrey: "#CBD5E1",
    inkBlack: "#0F172A",
    white: "#FFFFFF",
    semantic: {
      positive: "#2ED3A6",
      information: "#4EA8DE",
      warning: "#F5B942",
      risk: "#E85D75",
      neutral: "#94A3B8",
    },
  },
  typography: {
    display: '"Poppins", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    displayWeights: [600, 700, 800],
    bodyWeights: [400, 500, 600, 700],
  },
  radiusPx: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  spacingPx: [4, 8, 12, 16, 24, 32, 48, 64, 96],
  evidence: {
    VERIFIED: "Directly confirmed by a reliable first-party or authoritative source.",
    OBSERVED: "Directly visible or recorded, but not necessarily independently confirmed.",
    CALCULATED: "Derived deterministically from stated inputs and a defined formula.",
    MODELLED: "Estimated using an explicit model, assumptions or forecast.",
    HYPOTHESIS: "Plausible explanation requiring further evidence or testing.",
  },
  accessibility: {
    mintOnWhiteForSmallText: false,
    preferredDarkTextOnMint: "#0B1F3B",
  },
} as const;

export type InksightsEvidenceState = keyof typeof INKSIGHTS_BRAND.evidence;

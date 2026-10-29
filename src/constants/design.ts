import { Platform, StyleSheet } from "react-native";

// Shared spacing scale
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

// Rounded corners: 12-16 standard, 20-24 for sheets/cards
export const radius = {
  xs: 6,
  sm: 8,
  md: 12, // Standard controls & chips
  lg: 16, // Standard cards & buttons
  xl: 20, // Modal sheets
  full: 9999, // Pills & circular badges
  control: 12,
  group: 16,
  sheet: 24,
};

// Sizing standards: minimum 48x48 touch targets for accessibility
export const size = {
  minTouch: 48,
  touch: 48,
  control: 52,
  buttonLg: 56,
  smallIcon: 16,
  iconSmall: 18,
  icon: 24,
  iconLarge: 32,
  content: 720,
};

export const border = {
  hairline: StyleSheet.hairlineWidth,
  normal: 1,
  thick: 2,
};

// Soft shadows with cross-platform support (elevation on Android)
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    default: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    default: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    default: {
      elevation: 8,
    },
  }),
  primaryGlow: Platform.select({
    ios: {
      shadowColor: "#FF6B00",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    default: {
      elevation: 6,
    },
  }),
};

// Accessible typography: body font 16px+, high contrast line heights
export const type = StyleSheet.create({
  hero: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  label: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

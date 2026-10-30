import { StyleSheet } from "react-native";

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

// Accessible typography: body font 16px+, high contrast line heights
export const type = StyleSheet.create({
  hero: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: "Nunito_700Bold",
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  bodyBold: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

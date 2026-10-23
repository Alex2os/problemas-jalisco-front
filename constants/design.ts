import { StyleSheet } from "react-native";

// One shared scale. Color roles are defined separately in palette.ts.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 40,
};
export const radius = { control: 8, group: 12, sheet: 20 };
export const size = {
  touch: 44,
  control: 48,
  icon: 20,
  smallIcon: 16,
  content: 720,
};
export const border = { hairline: StyleSheet.hairlineWidth, normal: 1 };
export const type = StyleSheet.create({
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 15, lineHeight: 21, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 19 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: "600" },
});

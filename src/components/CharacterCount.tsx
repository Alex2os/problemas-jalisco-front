import { StyleSheet, Text } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export function CharacterCount({ count, limit }: { count: number; limit: number }) {
  const { colors } = useAppTheme();
  return (
    <Text
      accessibilityLabel={`${count} de ${limit} caracteres`}
      style={[styles.counter, { color: count >= limit ? colors.primaryText : colors.muted }]}
    >
      {count}/{limit}
    </Text>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: 12, lineHeight: 18, fontWeight: "600", textAlign: "right", flexShrink: 0 },
});

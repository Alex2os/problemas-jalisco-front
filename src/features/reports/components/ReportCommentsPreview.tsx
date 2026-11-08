import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { UserAvatar } from "@/components/UserAvatar";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReportComment } from "@/services/types";

export interface ReportCommentsPreviewProps {
  comments: ReportComment[];
  commentCount: number;
  loading: boolean;
  onOpenSheet: () => void;
}

export function ReportCommentsPreview({
  comments,
  commentCount,
  loading,
  onOpenSheet,
}: ReportCommentsPreviewProps) {
  const { colors } = useAppTheme();
  const previewList = comments.slice(0, 3);
  const totalCount = Math.max(commentCount, comments.length);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Comentarios (${totalCount}). Toca para ver la conversación completa`}
      onPress={onOpenSheet}
      style={styles.container}
    >
      {/* Encabezado: Título y Contador real */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text
            accessibilityRole="header"
            style={[styles.heading, { color: colors.text }]}
          >
            Comentarios
          </Text>
          <Text style={[styles.counter, { color: colors.textSecondary }]}>
            {totalCount}
          </Text>
        </View>

        <View style={styles.actionPrompt}>
          <Text style={[styles.viewAllText, { color: colors.primaryText }]}>
            {totalCount > 3 ? "Ver todos" : "Comentar"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.primaryText}
          />
        </View>
      </View>

      {/* Lista de vista previa (hasta 3 comentarios) o estado vacío */}
      {previewList.length > 0 ? (
        <View style={styles.previewList}>
          {previewList.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.commentItem,
                idx > 0 && [styles.separator, { borderTopColor: colors.border }],
              ]}
            >
              <View style={styles.avatar}>
                <UserAvatar size={28} tone="soft" />
              </View>

              <View style={styles.commentBody}>
                <Text
                  style={[styles.author, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.username || "Usuario"}
                </Text>
                <Text
                  style={[styles.commentText, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.user_comment}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: colors.raised, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color={colors.muted}
          />
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {loading
              ? "Cargando comentarios…"
              : "Aún no hay comentarios. Toca para ser el primero en opinar."}
          </Text>
        </View>
      )}

      {/* Botón secundario si hay más de 3 comentarios */}
      {totalCount > 3 && (
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.primaryText }]}>
            Ver los {totalCount} comentarios
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  heading: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
  counter: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  actionPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: size.minTouch,
  },
  viewAllText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  previewList: {
    gap: space.xs,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    paddingVertical: space.xs,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.sm,
  },
  avatar: {
    paddingTop: 2,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  author: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: radius.control,
    padding: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footerRow: {
    paddingTop: space.xs,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
});


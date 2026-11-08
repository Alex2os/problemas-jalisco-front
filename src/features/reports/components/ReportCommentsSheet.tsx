import React, { useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { UserAvatar } from "@/components/UserAvatar";
import { radius, size, space } from "@/constants/design";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSession } from "@/hooks/useReportState";
import { reportDate } from "@/services/report-format";
import type { ReportComment } from "@/services/types";

export interface ReportCommentsSheetProps {
  visible: boolean;
  onClose: () => void;
  reportId: number;
  comments: ReportComment[];
  totalCount: number;
  loading: boolean;
  onPostComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  error?: string;
}

export function ReportCommentsSheet({
  visible,
  onClose,
  reportId,
  comments,
  totalCount,
  loading,
  onPostComment,
  onDeleteComment,
  error,
}: ReportCommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const authenticated = useAuthSession();
  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const inputRef = useRef<TextInputInstance>(null);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || submitting) return;

    if (!authenticated) {
      onClose();
      router.push({
        pathname: "/auth/login",
        params: { returnTo: `/reporte/${reportId}` },
      });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await onPostComment(trimmed);
      setInputText("");
      Keyboard.dismiss();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo publicar el comentario.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentMenu = (comment: ReportComment) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const triggerDelete = () => {
      Alert.alert(
        "Eliminar comentario",
        "¿Quieres eliminar este comentario permanentemente?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              setDeletingId(comment.id);
              try {
                await onDeleteComment(comment.id);
              } catch (err) {
                Alert.alert(
                  "Error al eliminar",
                  err instanceof Error ? err.message : "Intenta de nuevo.",
                );
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Eliminar comentario"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            triggerDelete();
          }
        },
      );
    } else {
      Alert.alert("Opciones del comentario", undefined, [
        {
          text: "Eliminar comentario",
          style: "destructive",
          onPress: triggerDelete,
        },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Capa para tocar afuera y cerrar */}
        <Pressable
          style={styles.backdropTouch}
          accessibilityLabel="Cerrar comentarios"
          accessibilityRole="button"
          onPress={onClose}
        />

        {/* Panel Bottom Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Barra superior de arrastre / Handle */}
          <View style={styles.handleWrap}>
            <View
              style={[styles.handleBar, { backgroundColor: colors.borderStrong }]}
            />
          </View>

          {/* Cabecera del panel */}
          <View
            style={[styles.sheetHeader, { borderBottomColor: colors.border }]}
          >
            <View style={styles.headerTitleGroup}>
              <Text
                accessibilityRole="header"
                style={[styles.headerTitle, { color: colors.text }]}
              >
                Comentarios
              </Text>
              <Text style={[styles.headerCounter, { color: colors.textSecondary }]}>
                {Math.max(totalCount, comments.length)}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar panel de comentarios"
              hitSlop={8}
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.raised }]}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Lista de comentarios */}
          <FlatList
            data={comments}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.itemSeparator,
                  { borderBottomColor: colors.border },
                ]}
              />
            )}
            ListEmptyComponent={
              loading ? (
                <View style={styles.centerStatus}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={36}
                    color={colors.muted}
                  />
                  <Text style={[styles.emptyPrompt, { color: colors.muted }]}>
                    No hay comentarios todavía. ¡Sé el primero en opinar!
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const canDelete = authenticated && item.can_delete;
              const isDeleting = deletingId === item.id;

              return (
                <View style={styles.commentRow}>
                  <UserAvatar size={32} tone="soft" />

                  <View style={styles.commentMain}>
                    <View style={styles.commentMetaRow}>
                      <Text
                        style={[styles.authorName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.username || "Usuario"}
                      </Text>
                      <Text
                        style={[styles.commentDate, { color: colors.muted }]}
                      >
                        {reportDate(item.created_at)}
                      </Text>

                      {canDelete && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Opciones del comentario"
                          hitSlop={8}
                          disabled={isDeleting}
                          onPress={() => handleCommentMenu(item)}
                          style={styles.commentMoreBtn}
                        >
                          {isDeleting ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.danger}
                            />
                          ) : (
                            <Ionicons
                              name="ellipsis-horizontal"
                              size={16}
                              color={colors.textSecondary}
                            />
                          )}
                        </Pressable>
                      )}
                    </View>

                    <Text
                      style={[styles.commentBodyText, { color: colors.textSecondary }]}
                    >
                      {item.user_comment}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Banner de error si existe */}
          {(!!error || !!submitError) && (
            <View
              style={[
                styles.errorRow,
                { backgroundColor: colors.dangerSoft },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {submitError || error}
              </Text>
            </View>
          )}

          {/* Campo inferior estilo YouTube «Comenta tú...» */}
          <View
            style={[
              styles.inputFooter,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, space.sm),
              },
            ]}
          >
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.raised,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                placeholder="Comenta tú..."
                placeholderTextColor={colors.muted}
                value={inputText}
                onChangeText={setInputText}
                maxLength={100}
                returnKeyType="send"
                submitBehavior="submit"
                onSubmitEditing={handleSend}
                editable={!submitting}
                style={[styles.inputField, { color: colors.text }]}
              />

              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.inputAction}
                />
              ) : inputText.trim().length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Publicar comentario"
                  hitSlop={8}
                  onPress={handleSend}
                  style={styles.inputAction}
                >
                  <Ionicons name="send" size={18} color={colors.primary} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: "88%",
    height: "82%",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  headerCounter: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  closeButton: {
    width: size.minTouch,
    height: size.minTouch,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  itemSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: space.sm,
  },
  centerStatus: {
    padding: space.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: space.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  emptyPrompt: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  commentMain: {
    flex: 1,
    gap: 3,
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  authorName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  commentDate: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  commentMoreBtn: {
    paddingHorizontal: space.xs,
    paddingVertical: 2,
  },
  commentBodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorRow: {
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  inputWrap: {
    minHeight: size.control,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
  },
  inputField: {
    flex: 1,
    height: size.control,
    fontSize: 15,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  inputAction: {
    paddingLeft: space.xs,
    justifyContent: "center",
    alignItems: "center",
  },
});

import React from "react";
import { Alert, Pressable, Platform, ActionSheetIOS, StyleSheet } from "react-native";
import { MoreVertical } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/lib/providers/SessionProvider";
import { useReportContent, useBlockUser } from "@/lib/hooks/useModeration";

interface ReviewOptionsMenuProps {
  reviewId: string;
  authorId: string;
  authorName: string;
}

export function ReviewOptionsMenu({
  reviewId,
  authorId,
  authorName,
}: ReviewOptionsMenuProps) {
  const { session } = useSession();
  const currentUid = session.status === "authed" ? session.uid : null;

  const queryClient = useQueryClient();
  const reportMutation = useReportContent();
  const blockMutation = useBlockUser();

  const handleReport = () => {
    if (!currentUid) {
      Alert.alert("Notice", "You must be logged in to report content.");
      return;
    }

    reportMutation.mutate({
      reviewId,
      authorId,
      reportedByUid: currentUid,
    });

    Alert.alert(
      "Report Received",
      "Thank you. This content has been flagged and our team will review it within 24 hours.",
    );
  };

  const handleBlock = () => {
    if (!currentUid) {
      Alert.alert("Notice", "You must be logged in to block users.");
      return;
    }

    blockMutation.mutate(
      {
        blockedUid: authorId,
        blockedByUid: currentUid,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["blockedUsers", currentUid] });
        },
      },
    );

    Alert.alert("User Blocked", `You will no longer see content from ${authorName}.`);
  };

  const openMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Report Content", `Block ${authorName}`],
          destructiveButtonIndex: [1, 2], // Makes the text red
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleReport();
          if (buttonIndex === 2) handleBlock();
        },
      );
    } else {
      Alert.alert(
        "Options",
        "What would you like to do?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Report Content", style: "destructive", onPress: handleReport },
          { text: `Block ${authorName}`, style: "destructive", onPress: handleBlock },
        ],
        { cancelable: true },
      );
    }
  };

  return (
    <Pressable
      onPress={openMenu}
      style={styles.menuButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MoreVertical size={20} color="#94A3B8" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    margin: -8,
  },
});

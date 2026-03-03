import React, { 
  useCallback, 
  useEffect, 
  useState,
  useRef
} from "react";
import { 
  AppState, 
  ScrollView, 
  StyleSheet, 
  View, 
  Platform,
  Animated
} from "react-native";
import { 
  Stack as ExpoStack, 
  router, 
  useLocalSearchParams 
} from "expo-router";
import * as Haptics from "expo-haptics";
import * as StoreReview from 'expo-store-review';
import * as Sentry from "@sentry/react-native";
import LottieView from 'lottie-react-native';
import { ArrowLeft } from "lucide-react-native";
import { BlurView } from 'expo-blur'; 

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack as UIStack } from "@/components/ui/Stack";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useCone } from "@/lib/hooks/useCone";
import { useConeCompletionMutation } from "@/lib/hooks/useConeCompletionMutation";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useConeReviewsSummary } from "@/lib/hooks/useConeReviewsSummary";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useDraftsStore } from "@/lib/store";

import { ConeHero } from "@/components/cone/detail/ConeHero";
import { ReviewsSummaryCard } from "@/components/cone/detail/ReviewsSummaryCard";
import { StatusCard } from "@/components/cone/detail/StatusCard";
import { ActionsCard } from "@/components/cone/detail/ActionsCard";
import { ReviewModal } from "@/components/cone/detail/ReviewModal";
import { goConesHome, goConeReviews } from "@/lib/routes";
import { GAMEPLAY } from "@/lib/constants/gameplay";

const MAX_ACCURACY_METERS = GAMEPLAY.MAX_GPS_ACCURACY_METERS;

export default function ConeDetailRoute() {
  const { coneId } = useLocalSearchParams<{ coneId: string }>();
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  // DATA ALIGNMENT: Use the global completions list instead of a separate single doc fetch
  const { completedConeIds, sharedConeIds, loading: compsLoading } = useMyCompletions();
  
  const isCompleted = !!coneId && completedConeIds.has(coneId);
  const hasShareBonus = !!coneId && sharedConeIds.has(coneId);

  const [reviewErr, setReviewErr] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiRef = useRef(null);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const { cone, loading: coneLoading, err: coneErr } = useCone(coneId);
  const { location: loc, errorMsg: providerErr } = useLocation();
  const { refresh: refreshLocation, isRefreshing, err: manualErr } = useUserLocation();

  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : loc ? "granted" : "unknown";

  const {
    completeCone: triggerComplete,
    loading: completing,
    err: mutationErr,
    reset: resetMutationErr,
  } = useConeCompletionMutation();

  const gate = useGPSGate(cone, loc, { maxAccuracyMeters: MAX_ACCURACY_METERS });
  
  // Total count for review milestones
  const totalCompletions = completedConeIds.size;
  const reviewMilestones = [2, 10, 25];

  const {
    avgRating,
    ratingCount,
    myRating,
    myText: myReviewText,
    saving: reviewsSaving,
    saveReview: saveReviewToDb,
  } = useConeReviewsSummary(coneId);

  const [err, setErr] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  
  const { drafts, setDraft, clearDraft } = useDraftsStore();
  const currentDraft = drafts[coneId || ''] || { rating: null, text: "" };

  const refreshGPS = useCallback(async () => {
    if (locStatus !== "denied") await refreshLocation();
  }, [locStatus, refreshLocation]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && (!loc || (gate.accuracyMeters || 0) > MAX_ACCURACY_METERS)) {
        refreshGPS();
      }
    });
    return () => sub.remove();
  }, [loc, gate.accuracyMeters, refreshGPS]);

  useEffect(() => {
    if (showCelebration) {
      opacityAnim.setValue(1);
      confettiRef.current?.play();
      
      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setShowCelebration(false);
          }
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showCelebration, opacityAnim]);

  const handleComplete = async () => {
    if (!cone || isCompleted || completing) return;
    setErr("");
    resetMutationErr();

    if (!uid) {
      setErr("Sign in to save your visit.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!gate.inRange) {
      setErr(gate.distanceMeters ? `You're ${Math.round(gate.distanceMeters)}m away.` : "Not in range.");
      return;
    }

    if (loc) {
      const res = await triggerComplete({ uid, cone, loc, gate });
      if (res.ok) {
        setShowCelebration(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(async () => {
          if (reviewMilestones.includes(totalCompletions)) {
            try {
              if (await StoreReview.hasAction()) {
                await StoreReview.requestReview();
              }
            } catch (error) {
              Sentry.captureException(error);
            }
          }
        }, 1500);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  if (coneLoading || compsLoading || session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Preparing summit..." />
      </Screen>
    );
  }

  if (coneErr || !cone) {
    return (
      <Screen>
        <ErrorCard
          title="Peak Not Found"
          message={coneErr || "Could not find volcano."}
          action={{ label: "Go Back", onPress: goConesHome }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ExpoStack.Screen
        options={{ 
          title: cone.name, 
          headerTransparent: true, 
          headerTintColor: "#fff", 
          headerLeft: () => null 
        }}
      />

      <View style={styles.floatingHeader}>
        <BlurView 
          intensity={Platform.OS === 'ios' ? 40 : 80} 
          tint="dark"
          style={styles.blurContainer}
        >
          <AppButton 
            variant="ghost" 
            size="sm" 
            onPress={goConesHome} 
            style={styles.backBtn}
          >
            <ArrowLeft size={16} color="#ffffff" />
            <AppText variant="label" style={styles.backText}>
              Back to Volcanoes
            </AppText>
          </AppButton>
        </BlurView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <ConeHero cone={cone} completed={isCompleted} />

        <UIStack gap="md" style={styles.content}>
          {(err || mutationErr) && (
            <ErrorCard
              status="warning"
              title="Check-in Issue"
              message={err || mutationErr || "An unknown error occurred"}
            />
          )}

          <StatusCard
            completed={isCompleted}
            loc={loc}
            locStatus={locStatus}
            accuracyMeters={gate.accuracyMeters}
            distanceMeters={gate.distanceMeters}
            inRange={gate.inRange}  
            onRefreshGPS={refreshGPS}
            refreshingGPS={isRefreshing}
          />

          <ReviewsSummaryCard
            ratingCount={ratingCount}
            avgRating={avgRating}
            onViewAll={() => goConeReviews(cone.id, cone.name)}
          />

          <ActionsCard
            completed={isCompleted}
            saving={completing}
            hasLoc={!!loc}
            onComplete={handleComplete}
            hasReview={!!myRating}
            myReviewRating={myRating}
            myReviewText={myReviewText}
            onOpenReview={() => setReviewOpen(true)}
            onShareBonus={() =>
              router.push({
                pathname: "/share-frame",
                params: { coneId: cone.id, coneName: cone.name },
              })
            }
          />
        </UIStack>
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        saving={reviewsSaving}
        draftRating={currentDraft.rating}
        draftText={currentDraft.text}
        error={reviewErr}
        onChangeRating={(val) => {
          if (coneId) setDraft(coneId, val, currentDraft.text);
          setReviewErr(null);
        }}
        onChangeText={(text) => {
          if (coneId) setDraft(coneId, currentDraft.rating, text);
          setReviewErr(null);
        }}
        onClose={() => {
          setReviewOpen(false);
          setReviewErr(null);
        }}
        onSave={async () => {
          setReviewErr(null);
          const res = await saveReviewToDb({
            coneId: cone.id,
            coneSlug: cone.slug,
            coneName: cone.name,
            reviewRating: currentDraft.rating!,
            reviewText: currentDraft.text,
          });
          if (res.ok) {
            if (coneId) clearDraft(coneId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setReviewOpen(false);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setReviewErr(res.err);
          }
        }}
      />

     {showCelebration && (
        <View style={[styles.confettiOverlay]} pointerEvents="none">
          <LottieView
            ref={confettiRef}
            autoPlay
            loop={false}
            source={require('@/assets/animations/success.confetti.json')} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onAnimationFinish={() => setShowCelebration(false)} 
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    top: 54, 
    right: 16,
    zIndex: 100,
    overflow: 'hidden',
    borderRadius: 24,
  },
  blurContainer: {
    padding: 2,
    borderRadius: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  backText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  scroll: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, 
    elevation: 9999,
  },
});
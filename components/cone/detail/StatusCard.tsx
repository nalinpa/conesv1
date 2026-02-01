import { View } from "react-native";
import { Text, Button, Divider } from "@ui-kitten/components";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pill } from "@/components/ui/Pill";
import { formatMeters } from "@/lib/formatters";

type GateView = {
  inRange: boolean;
  distanceMeters: number | null;
  accuracyMeters: number | null;

  checkpointId?: string | null;
  checkpointLabel?: string | null;
  checkpointLat?: number | null;
  checkpointLng?: number | null;
  checkpointRadius?: number | null;
};

export function StatusCard({
  hasLoc,
  locStatus,
  locErr,
  topErr,
  gate,
  onRefreshGPS,
}: {
  hasLoc: boolean;
  locStatus: string;
  locErr: string | null;
  topErr: string;
  gate: GateView;
  onRefreshGPS: () => void;
}) {
  const errText = topErr || locErr || "";

  return (
    <CardShell>
      <Text category="h6" style={{ fontWeight: "900" }}>
        Status
      </Text>

      <View style={{ height: 12 }} />

      {!hasLoc ? (
        <LoadingState
          fullScreen={false}
          size="small"
          label={locStatus === "denied" ? "Location permission denied" : "Getting your GPS…"}
          style={{ paddingVertical: 6 }}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {gate.checkpointLabel ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text appearance="hint">Checkpoint</Text>
              <Text style={{ fontWeight: "800" }}>{gate.checkpointLabel}</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text appearance="hint">Distance</Text>
            <Text style={{ fontWeight: "800" }}>{formatMeters(gate.distanceMeters)}</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text appearance="hint">Accuracy</Text>
            <Text style={{ fontWeight: "800" }}>
              {gate.accuracyMeters == null ? "—" : `${Math.round(gate.accuracyMeters)} m`}
            </Text>
          </View>

          <Divider />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text appearance="hint">Range check</Text>
            <Pill status={gate.inRange ? "success" : "danger"}>
              {gate.inRange ? "✅ In range" : "❌ Not in range"}
            </Pill>
          </View>

          <Button appearance="outline" onPress={onRefreshGPS}>
            Refresh GPS
          </Button>
        </View>
      )}

      {errText ? (
        <View style={{ marginTop: 12 }}>
          <Pill status="danger">{errText}</Pill>
        </View>
      ) : null}
    </CardShell>
  );
}

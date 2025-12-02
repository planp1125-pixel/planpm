import { InstrumentDetailClientPage } from "@/components/instruments/instrument-detail-client-page";

export default function InstrumentDetailPage({
  params,
}: {
  params: { instrumentId: string };
}) {
  return <InstrumentDetailClientPage instrumentId={params.instrumentId} />;
}

    
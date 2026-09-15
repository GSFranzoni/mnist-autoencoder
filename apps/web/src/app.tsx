import { useQuery } from "@tanstack/react-query";

import { NetworkLoadingScreen } from "@/components/network-loading-screen";
import { Playground } from "@/playground";
import { networkQueryOptions } from "@/queries/network.query";

export function App() {
  const network = useQuery(networkQueryOptions);

  if (network.isPending) {
    return <NetworkLoadingScreen />;
  }

  if (network.isError || !network.data) {
    return (
      <main className="bg-background text-foreground grid min-h-dvh place-items-center px-5 text-center">
        <p className="text-xl font-semibold">
          the tiny brain could not wake up — reload to try again ✎
        </p>
      </main>
    );
  }

  return <Playground model={network.data} />;
}

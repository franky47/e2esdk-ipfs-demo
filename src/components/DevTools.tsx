import { useRef, useEffect } from "react";

import { E2ESDKDevtoolsElement } from "@socialgouv/e2esdk-devtools";
import { useE2ESDKClient } from "@socialgouv/e2esdk-react";

export const DevTools = () => {
  const client = useE2ESDKClient();
  const ref = useRef<E2ESDKDevtoolsElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.client = client;
  }, [client]);
  return <e2esdk-devtools ref={ref} theme="dark" />;
};

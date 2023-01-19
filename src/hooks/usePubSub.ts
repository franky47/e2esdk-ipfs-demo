import { IPFS } from "ipfs-core-types";
import { useState, useEffect } from "react";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

export function usePubSub(ipfs: IPFS | null, topic: string) {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    if (ipfs) {
      ipfs.pubsub.subscribe(topic, (evt) => {
        console.info(
          `pubsub.received: ${uint8ArrayToString(evt.data)} on topic ${
            evt.topic
          }`
        );
        setMessages([...messages, uint8ArrayToString(evt.data)]);
      });
      return () => {
        ipfs.pubsub.unsubscribe(topic);
        console.log("unsubscribe");
      };
    }
  }, [ipfs, topic, messages, setMessages]);

  return messages;
}

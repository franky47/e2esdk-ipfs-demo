import { IPFS } from "ipfs-core-types";
import { useState, useEffect } from "react";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

export function usePubSub(ipfs: IPFS | null, topic: string) {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    if (ipfs && ipfs.isOnline() && messages.length === 0) {
      console.info(`pubsub.subscribe ${topic}`);
      ipfs.pubsub.subscribe(topic, (evt) => {
        console.info(
          `pubsub.received: ${uint8ArrayToString(evt.data)} on topic ${
            evt.topic
          }`
        );
        setMessages([...messages, uint8ArrayToString(evt.data)]);
      });
    }

    return () => {
      if (ipfs) {
        console.info(`pubsub.unsubscribe ${topic}`);
        ipfs.pubsub.unsubscribe(topic);
      }
    };
  }, [ipfs, topic, messages, setMessages]);

  return messages;
}

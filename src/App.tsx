import Dropzone, { DropzoneOptions } from "react-dropzone";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

import { Client } from "@socialgouv/e2esdk-client";
import { E2ESDKClientProvider } from "@socialgouv/e2esdk-react";

import { usePubSub } from "./hooks/usePubSub";
import { IpfsImage } from "./components/IpfsImage";
import { IpfsProvider } from "./components/IpfsProvider";

import "./App.css";
import { useIpfs } from "./hooks/useIpfs";
import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { ipfsContext } from "./ipfsContext";

import { client } from "./e2esdk-client";

import "@socialgouv/e2esdk-devtools";
import { E2ESDKDevtoolsElement } from "@socialgouv/e2esdk-devtools";
import { useE2ESDKClient } from "@socialgouv/e2esdk-react";

export const Devtools = () => {
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

const PUBSUB_TOPIC = "test-messages";

const IpfsStatus = () => {
  const ipfs = useContext(ipfsContext);
  return (
    <div>
      IPFS ready :{" "}
      {ipfs?.isOnline() ? (
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            background: "green",
          }}
        />
      ) : (
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            background: "red",
          }}
        />
      )}
    </div>
  );
};

function Sample2({}) {
  const ipfs = useContext(ipfsContext);
  const [messages, setMessages] = useState<string[] | null>(null);
  const [text, setText] = useState("");

  const saveFileToIpfs = async (file: File) => {
    if (!ipfs) {
      return;
    }
    const fileDetails = {
      path: file.name,
      content: file,
    };

    const options = {
      // wrapWithDirectory: true,
      progress: (prog: number) => console.log(`received: ${prog}`),
    };

    try {
      const added = await ipfs.add(fileDetails, options);
      return added.cid.toString();
    } catch (err) {
      //@ts-ignore
      console.error("error uploading image", err.message);
    }
  };

  const onMessage = (data: any) => {
    const newText = uint8ArrayToString(data);
    console.info(
      `pubsub.received: ${newText} on topic ${PUBSUB_TOPIC}`,
      messages && messages.length
    );
    setMessages([...(messages || []), newText]);
  };

  useEffect(
    function () {
      if (ipfs && !messages) {
        console.log("subscribe", PUBSUB_TOPIC);
        ipfs.pubsub.subscribe(PUBSUB_TOPIC, (evt) => onMessage(evt.data));
        setMessages([]);
      }
      return () => {};
      /*
    const init = async () => {
      if (ipfs) {
        await ipfs.pubsub.subscribe(PUBSUB_TOPIC, onMessage);
      }
    };
    if (ipfs && messages.length === 0) {
      console.log("subscribe", PUBSUB_TOPIC);
      init();
    }
    */
    },
    [ipfs, messages]
  );

  const onDrop: DropzoneOptions["onDrop"] = async (acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      const cid = await saveFileToIpfs(file);
      if (ipfs && cid) {
        console.info("pubsub.publish", cid);
        ipfs.pubsub.publish(PUBSUB_TOPIC, uint8ArrayFromString("cid:" + cid));
      }
    });
  };

  const send = () => {
    //const nameFingerprint
    const keyLabel = "my-ipfs-workspace";
    const key = client.findKeyByLabel(keyLabel);
    if (key) {
      const encrypted = client.encrypt(text, key?.nameFingerprint);
      if (ipfs) {
        ipfs.pubsub.publish(
          PUBSUB_TOPIC,
          uint8ArrayFromString("cipher:" + encrypted)
        );
        setText("");
      }
    }
  };

  const decryptedMessages =
    (messages &&
      messages.map((msg) => {
        const keyLabel = "my-ipfs-workspace";
        if (msg.startsWith("cipher:")) {
          try {
            const key = client.findKeyByLabel(keyLabel);
            if (key) {
              const decrypted = client.decrypt(
                msg.slice(7),
                key?.nameFingerprint
              );
              return decrypted;
            }
          } catch (e) {
            console.error(e);
            return msg;
          }
        }
        return msg;
      })) ||
    [];

  return (
    <div>
      <div>
        <button onClick={() => onMessage(uint8ArrayFromString("coucou"))}>
          setMessages
        </button>
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <section className="drop-zone">
              <br />
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
        <br />
        <br />
        <textarea
          onChange={(e) => setText(e.currentTarget.value)}
          style={{ width: 500, height: 100 }}
          value={text}
        ></textarea>
        <br />
        <button onClick={send}>Send</button>
        <br />
        <br />
        <br />
        <div style={{ fontSize: "1.5em" }}>
          {ipfs &&
            decryptedMessages.map((message, i) => (
              <li key={i}>{message as string}</li>
            ))}
        </div>
        <br />
        <br />
      </div>
    </div>
  );
}

function App() {
  return (
    <E2ESDKClientProvider client={client}>
      <IpfsProvider>
        <div className="App">
          <h1>e2esdk + IPFS demo</h1>
          <IpfsStatus />
          <Sample2 />
        </div>
      </IpfsProvider>
      <br />
      <br />
      <br />
      <Devtools />
    </E2ESDKClientProvider>
  );
}

export default App;

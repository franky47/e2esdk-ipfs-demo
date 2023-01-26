import { useContext } from "react";
import { ipfsContext } from "../ipfsContext";

export const IpfsStatus = () => {
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

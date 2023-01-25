import { Client } from "@socialgouv/e2esdk-client";
import qs from "query-string";

const params = qs.parse(document.location.search);

const serverURL = "https://e2esdk.dev.fabrique.social.gouv.fr";
const serverPublicKey = "_XDQj6-paJAnpCp_pfBhGUUe6cA0MjLXsgAOgYDhCRI";

const mainKeyStr = params.mainKey; //"Yl62MSH6Gke5So1aPKhtWidL5WcMUh8tLlNW1pU_oeg";
const userId = params.userId; //"ffee47af-2edc-479f-8a1e-47544f243085";

// BR2CNk3hy_B0fDmdmG5dP3iQWnqs843h_jMZ1jp4uYw
// 9e86ed59-9a73-4f45-992a-4df80304b5bb

export const client = new Client({
  serverURL: serverURL,
  serverPublicKey: serverPublicKey,
  handleNotifications: true,
});
const mainKey = client.decode(mainKeyStr);
await client.sodium.ready;

client
  .signup(userId, mainKey)
  .catch((e) => {
    console.log(e.message);
    if (e.message === "This account was already registered") {
      return client.login(userId, mainKey);
    }
    throw e;
  })
  .then(() => {
    client.sodium.memzero(mainKey);
    //  return client.createKey("my-ipfs-workspace", "secretBox");
  });

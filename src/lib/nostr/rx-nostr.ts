import { createRxNostr } from "rx-nostr";
import { verifier } from "@rx-nostr/crypto";
import { relaySearchRelays } from "$lib/store/constants";

const rxNostr = createRxNostr({ verifier });
rxNostr.setDefaultRelays(relaySearchRelays);

export async function get10002(pubkey: string) {}

import {getPublicKey, finalizeEvent} from '@nostr/tools/pure'
import {decode} from '@nostr/tools/nip19'
import * as nip04 from '@nostr/tools/nip04'
import * as nip44 from '@nostr/tools/nip44'
import type {Signer} from './signer.js'

export default function (nsec: string): Signer {
  const decoded = decode(nsec)
  if (decoded.type !== 'nsec') throw new Error('not an nsec')

  const sk = decoded.data as Uint8Array
  const pk = getPublicKey(sk)

  return {
    async getPublicKey() {
      return pk
    },
    async signEvent(event) {
      return finalizeEvent(event, sk)
    },
    async nip04Decrypt(thirdPartyPubkey, ciphertext) {
      return nip04.decrypt(sk, thirdPartyPubkey, ciphertext)
    },
    async nip04Encrypt(thirdPartyPubkey, plaintext) {
      return nip04.encrypt(sk, thirdPartyPubkey, plaintext)
    },
    async nip44Decrypt(thirdPartyPubkey, ciphertext) {
      const conv = nip44.getConversationKey(sk, thirdPartyPubkey)
      return nip44.decrypt(ciphertext, conv)
    },
    async nip44Encrypt(thirdPartyPubkey, plaintext) {
      const conv = nip44.getConversationKey(sk, thirdPartyPubkey)
      return nip44.encrypt(plaintext, conv)
    }
  }
}

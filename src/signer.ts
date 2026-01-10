import type {EventTemplate, VerifiedEvent} from 'nostr-tools/pure'

export interface Signer {
  getPublicKey(): Promise<string>
  signEvent(event: EventTemplate): Promise<VerifiedEvent>
  nip04Encrypt(thirdPartyPubkey: string, plaintext: string): Promise<string>
  nip04Decrypt(thirdPartyPubkey: string, ciphertext: string): Promise<string>
  nip44Encrypt(thirdPartyPubkey: string, plaintext: string): Promise<string>
  nip44Decrypt(thirdPartyPubkey: string, ciphertext: string): Promise<string>
}

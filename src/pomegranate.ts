import {generateSecretKey, finalizeEvent} from '@nostr/tools/pure'
import {bytesToHex} from '@noble/hashes/utils'
import {sha256} from '@noble/hashes/sha256'
import {argon2id} from '@noble/hashes/argon2'
import {
  trustedKeyDeal,
  hexPubShard,
  hexShard,
} from '@fiatjaf/promenade-trusted-dealer'
import {pool} from '@nostr/gadgets/global'
import {loadRelayList} from '@nostr/gadgets/lists'

export let POMEGRANATE_CENTRAL_URL = 'https://auth.njump.me'
export function setCentralUrl(url: string) { POMEGRANATE_CENTRAL_URL = url }

export const POMEGRANATE_OPERATORS = [
  'https://po.f7z.io',
  'https://po.njump.me',
  'https://po.nostrver.se',
  'https://po.coracle.social',
  'https://po.jumble.social'
]

export const POMEGRANATE_THRESHOLD = 2

const KIND_SETUP_ANNOUNCEMENT = 16440
const BIG_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
]

const encoder = new TextEncoder()

export async function searchForActualCentralURLAnnounced(email: string): Promise<string | null> {
  if (!email) return null
  const hash = bytesToHex(argon2id(encoder.encode(email), 'pomegranate', {t: 1, m: 65536, p: 4}))
  const results = await pool.querySync(BIG_RELAYS, {kinds: [KIND_SETUP_ANNOUNCEMENT], '#m': [hash], limit: 1}, {maxWait: 5000})
  if (results.length) {
    const centralTag = results[0].tags?.find(
      (t: string[]) => Array.isArray(t) && t[0] === 'central' && typeof t[1] === 'string'
    )
    if (centralTag?.[1]) return centralTag[1]
  }
  return null
}

export async function pomegranateRegister(token: string, email: string) {
  const sk = generateSecretKey()
  const session = crypto.randomUUID()

  const skBignum = Array.from(sk).reduce<bigint>(
    (acc, byte) => (acc << 8n) + BigInt(byte as number),
    0n
  )
  const {shards} = trustedKeyDeal(
    skBignum,
    POMEGRANATE_THRESHOLD,
    POMEGRANATE_OPERATORS.length
  )

  const regEvent = finalizeEvent(
    {
      kind: 20445,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['threshold', String(POMEGRANATE_THRESHOLD)],
        ...POMEGRANATE_OPERATORS.map((op, i) => [
          'operator',
          op,
          hexPubShard(shards[i].pubShard)
        ])
      ],
      content: ''
    },
    sk
  )

  const regResp = await fetch(`${POMEGRANATE_CENTRAL_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(regEvent),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
      'X-Pomegranate-Session': session
    }
  })
  if (!regResp.ok) throw new Error('Central registration failed')

  for (let i = 0; i < POMEGRANATE_OPERATORS.length; i++) {
    const opEvent = finalizeEvent(
      {
        kind: 20444,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['central', POMEGRANATE_CENTRAL_URL],
          ['email', email]
        ],
        content: hexShard(shards[i])
      },
      sk
    )

    const opResp = await fetch(`${POMEGRANATE_OPERATORS[i]}/po/register`, {
      method: 'POST',
      body: JSON.stringify(opEvent),
      headers: {
        'Content-Type': 'application/json',
        'X-Pomegranate-Operator-Token': bytesToHex(
          sha256(encoder.encode(session + ':' + POMEGRANATE_OPERATORS[i]))
        )
      }
    })
    if (!opResp.ok)
      throw new Error(
        `Operator registration failed for ${POMEGRANATE_OPERATORS[i]}`
      )
  }

  const hash = bytesToHex(
    argon2id(encoder.encode(email), 'pomegranate', {t: 1, m: 65536, p: 4})
  )
  const annEvent = finalizeEvent(
    {
      kind: KIND_SETUP_ANNOUNCEMENT,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['m', hash],
        ['central', POMEGRANATE_CENTRAL_URL]
      ],
      content: ''
    },
    sk
  )
  await Promise.allSettled(
    pool.publish(
      [
        ...BIG_RELAYS,
        ...(await loadRelayList(annEvent.pubkey)).items
          .filter(r => r.write)
          .map(r => r.url)
      ],
      annEvent
    )
  )
}

export async function setupPomegranateProfile(token: string): Promise<string> {
  const profilesResp = await fetch(`${POMEGRANATE_CENTRAL_URL}/profiles`, {
    headers: {Authorization: `Token ${token}`}
  })
  if (!profilesResp.ok) throw new Error('Failed to get profiles')

  let profiles = await profilesResp.json()

  if (!profiles.find((p: any) => p.name === 'default')) {
    await fetch(`${POMEGRANATE_CENTRAL_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({name: 'default'})
    })
    const refreshResp = await fetch(`${POMEGRANATE_CENTRAL_URL}/profiles`, {
      headers: {Authorization: `Token ${token}`}
    })
    if (refreshResp.ok) profiles = await refreshResp.json()
  }

  const defaultProfile = profiles.find((p: any) => p.name === 'default')
  if (!defaultProfile) throw new Error('No default profile available')

  return `bunker://${defaultProfile.handler_pubkey}?relay=${encodeURIComponent(POMEGRANATE_CENTRAL_URL.replace('http', 'ws'))}`
}

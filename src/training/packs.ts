import { useEffect, useState } from 'react'
import type { PackIndex, TrainingPack } from './types'

const BASE = `${import.meta.env.BASE_URL}packs`

/** Loads every pack listed in public/packs/index.json at runtime, so a new pack is just a new folder. */
export async function loadPacks(): Promise<{ packs: TrainingPack[]; index: PackIndex }> {
  const index: PackIndex = await fetch(`${BASE}/index.json`, { cache: 'no-store' }).then((r) => r.json())
  const packs = await Promise.all(
    index.packs.map((id) =>
      fetch(`${BASE}/${id}/pack.json`, { cache: 'no-store' })
        .then((r) => r.json() as Promise<TrainingPack>)
        .catch((e) => {
          console.error(`Training pack "${id}" failed to load`, e)
          return null
        }),
    ),
  )
  return { packs: packs.filter((p): p is TrainingPack => !!p), index }
}

export function usePacks() {
  const [state, setState] = useState<{ packs: TrainingPack[]; index: PackIndex } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    loadPacks().then(setState, (e) => setError(String(e)))
  }, [])
  return { ...state, error, loading: !state && !error }
}

export const moduleKey = (packId: string, moduleId: string) => `${packId}/${moduleId}`

import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { Doc } from '~/domain/doc'

export type DocUpdater = (prev: Doc) => Doc

/**
 * Read and write the entire check document, which lives in the URL search
 * params. Writes use `replace` so the back button isn't flooded with every
 * keystroke / map edit.
 */
export function useDoc(): [Doc, (updater: DocUpdater) => void] {
  const doc = useSearch({ strict: false }) as Doc
  const navigate = useNavigate()

  const setDoc = useCallback(
    (updater: DocUpdater) => {
      navigate({
        // stay on the current route, only update search
        to: '.',
        search: (prev) => updater(prev as Doc) as never,
        replace: true,
      })
    },
    [navigate],
  )

  return [doc, setDoc]
}

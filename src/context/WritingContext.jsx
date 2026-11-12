import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

const WritingContext = createContext(null)

const LEGACY_SAVED_VERSIONS_KEY = 'humanizer-saved-versions'
const LEGACY_VOICE_SAMPLES_KEY = 'humanizer-voice-samples'
const LEGACY_VOICE_PROFILE_KEY = 'humanizer-voice-profile'
const LEGACY_WRITING_HISTORY_KEY = 'humanizer-writing-history'

function readLegacyStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key)

    if (!value) return fallback

    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function createLocalId() {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
}

export function WritingProvider({ children }) {
  const [user, setUser] = useState(null)

  const [writingHistory, setWritingHistory] = useState([])
  const [savedVersions, setSavedVersions] = useState([])
  const [voiceSamples, setVoiceSamples] = useState([])
  const [voiceProfile, setVoiceProfile] = useState(null)

  const [isLoadingWritingData, setIsLoadingWritingData] =
    useState(true)

  /*
   * We keep the old browser data untouched.
   * It is NOT automatically uploaded to another account.
   */
  const legacyData = {
    savedVersions: readLegacyStorage(
      LEGACY_SAVED_VERSIONS_KEY,
      [],
    ),
    voiceSamples: readLegacyStorage(
      LEGACY_VOICE_SAMPLES_KEY,
      [],
    ),
    voiceProfile: readLegacyStorage(
      LEGACY_VOICE_PROFILE_KEY,
      null,
    ),
    writingHistory: readLegacyStorage(
      LEGACY_WRITING_HISTORY_KEY,
      [],
    ),
  }

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!mounted) return

      setUser(currentUser)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return

        setUser(session?.user ?? null)
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setWritingHistory([])
      setSavedVersions([])
      setVoiceSamples([])
      setVoiceProfile(null)
      setIsLoadingWritingData(false)
      return
    }

    let cancelled = false

    const loadWritingData = async () => {
      setIsLoadingWritingData(true)

      try {
        const [
          historyResponse,
          savedResponse,
          samplesResponse,
          profileResponse,
        ] = await Promise.all([
          supabase
            .from('humanizer_writing_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('humanizer_saved_versions')
            .select('*')
            .eq('user_id', user.id)
            .order('saved_at', {
              ascending: false,
            }),

          supabase
            .from('humanizer_voice_samples')
            .select('*')
            .eq('user_id', user.id)
            .order('position', {
              ascending: true,
            }),

          supabase
            .from('humanizer_voice_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
        ])

        if (historyResponse.error) {
          throw historyResponse.error
        }

        if (savedResponse.error) {
          throw savedResponse.error
        }

        if (samplesResponse.error) {
          throw samplesResponse.error
        }

        if (profileResponse.error) {
          throw profileResponse.error
        }

        if (cancelled) return

        setWritingHistory(
          (historyResponse.data || []).map((entry) => ({
            id: entry.id,
            originalText: entry.original_text,
            mode: entry.mode,
            instructions: entry.instructions || '',
            versions: entry.versions || [],
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
          })),
        )

        setSavedVersions(
          (savedResponse.data || []).map((entry) => ({
            id: entry.id,
            ...(entry.version_data || {}),
            savedAt: entry.saved_at,
          })),
        )

        setVoiceSamples(
          (samplesResponse.data || []).map(
            (entry) => entry.sample_text,
          ),
        )

        setVoiceProfile(
          profileResponse.data?.profile_data || null,
        )
      } catch (error) {
        console.error(
          'Failed to load Humanizer writing data:',
          error,
        )

        if (!cancelled) {
          setWritingHistory([])
          setSavedVersions([])
          setVoiceSamples([])
          setVoiceProfile(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWritingData(false)
        }
      }
    }

    loadWritingData()

    return () => {
      cancelled = true
    }
  }, [user])

  const addHistoryEntry = async ({
    originalText,
    mode,
    instructions = '',
    versions = [],
  }) => {
    if (!user) {
      throw new Error('You must be signed in to save writing history.')
    }

    const { data, error } = await supabase
      .from('humanizer_writing_history')
      .insert({
        user_id: user.id,
        original_text: originalText,
        mode,
        instructions,
        versions,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const newEntry = {
      id: data.id,
      originalText: data.original_text,
      mode: data.mode,
      instructions: data.instructions || '',
      versions: data.versions || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    setWritingHistory((current) => [
      newEntry,
      ...current,
    ])

    return newEntry
  }

  const updateHistoryEntry = async (
    id,
    updates,
  ) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const databaseUpdates = {}

    if (updates.originalText !== undefined) {
      databaseUpdates.original_text =
        updates.originalText
    }

    if (updates.mode !== undefined) {
      databaseUpdates.mode = updates.mode
    }

    if (updates.instructions !== undefined) {
      databaseUpdates.instructions =
        updates.instructions
    }

    if (updates.versions !== undefined) {
      databaseUpdates.versions = updates.versions
    }

    const { data, error } = await supabase
      .from('humanizer_writing_history')
      .update(databaseUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    const updatedEntry = {
      id: data.id,
      originalText: data.original_text,
      mode: data.mode,
      instructions: data.instructions || '',
      versions: data.versions || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    setWritingHistory((current) =>
      current.map((entry) =>
        entry.id === id ? updatedEntry : entry,
      ),
    )

    return updatedEntry
  }

  const removeHistoryEntry = async (id) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const { error } = await supabase
      .from('humanizer_writing_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    setWritingHistory((current) =>
      current.filter((entry) => entry.id !== id),
    )
  }

  const clearWritingHistory = async () => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const { error } = await supabase
      .from('humanizer_writing_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    setWritingHistory([])
  }

  const saveVersion = async (version) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const versionData = {
      id: version.id || createLocalId(),
      label: version.label || 'Saved version',
      text: version.text || '',
      mode: version.mode || null,
    }

    const { data, error } = await supabase
      .from('humanizer_saved_versions')
      .insert({
        user_id: user.id,
        version_data: versionData,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const savedVersion = {
      id: data.id,
      ...data.version_data,
      savedAt: data.saved_at,
    }

    setSavedVersions((current) => [
      savedVersion,
      ...current,
    ])

    return savedVersion
  }

  const removeSavedVersion = async (id) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const { error } = await supabase
      .from('humanizer_saved_versions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    setSavedVersions((current) =>
      current.filter((version) => version.id !== id),
    )
  }

  const addVoiceSample = async (sampleText) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    if (voiceSamples.length >= 5) {
      throw new Error(
        'You can save up to 5 writing samples.',
      )
    }

    const cleanText = sampleText.trim()

    if (!cleanText) {
      throw new Error('Writing sample cannot be empty.')
    }

    const { data, error } = await supabase
      .from('humanizer_voice_samples')
      .insert({
        user_id: user.id,
        sample_text: cleanText,
        position: voiceSamples.length,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    setVoiceSamples((current) => [
      ...current,
      data.sample_text,
    ])

    /*
     * Samples changed, so the previous analysis is no longer
     * guaranteed to represent the current samples.
     */
    if (voiceProfile) {
      const { error: profileDeleteError } =
        await supabase
          .from('humanizer_voice_profiles')
          .delete()
          .eq('user_id', user.id)

      if (profileDeleteError) {
        console.error(
          'Failed to clear old voice profile:',
          profileDeleteError,
        )
      }

      setVoiceProfile(null)
    }

    return data
  }

  const removeVoiceSample = async (index) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const { data: samples, error: fetchError } =
      await supabase
        .from('humanizer_voice_samples')
        .select('id, sample_text, position')
        .eq('user_id', user.id)
        .order('position', {
          ascending: true,
        })

    if (fetchError) {
      throw fetchError
    }

    const target = samples?.[index]

    if (!target) {
      throw new Error('Writing sample not found.')
    }

    const { error: deleteError } =
      await supabase
        .from('humanizer_voice_samples')
        .delete()
        .eq('id', target.id)
        .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    const remaining = samples.filter(
      (_, sampleIndex) => sampleIndex !== index,
    )

    /*
     * Re-number the remaining rows using their existing UUIDs.
     * This avoids the duplicate-row problem that would happen
     * if we tried to upsert by user_id + position.
     */
    for (let position = 0; position < remaining.length; position++) {
      const sample = remaining[position]

      const { error: updateError } =
        await supabase
          .from('humanizer_voice_samples')
          .update({ position })
          .eq('id', sample.id)
          .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }
    }

    setVoiceSamples(
      remaining.map((sample) => sample.sample_text),
    )

    if (voiceProfile) {
      const { error: profileDeleteError } =
        await supabase
          .from('humanizer_voice_profiles')
          .delete()
          .eq('user_id', user.id)

      if (profileDeleteError) {
        console.error(
          'Failed to clear old voice profile:',
          profileDeleteError,
        )
      }

      setVoiceProfile(null)
    }
  }

  const saveVoiceProfile = async (profile) => {
    if (!user) {
      throw new Error('You must be signed in.')
    }

    const { data, error } = await supabase
      .from('humanizer_voice_profiles')
      .upsert(
        {
          user_id: user.id,
          profile_data: profile,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        },
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    setVoiceProfile(data.profile_data)

    return data.profile_data
  }

  const clearVoiceProfile = async () => {
    if (!user) return

    const { error } = await supabase
      .from('humanizer_voice_profiles')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    setVoiceProfile(null)
  }

  const value = {
    user,
    isLoadingWritingData,

    writingHistory,
    savedVersions,
    voiceSamples,
    voiceProfile,

    addHistoryEntry,
    updateHistoryEntry,
    removeHistoryEntry,
    clearWritingHistory,

    saveVersion,
    removeSavedVersion,

    addVoiceSample,
    removeVoiceSample,
    saveVoiceProfile,
    clearVoiceProfile,

    legacyData,
  }

  return (
    <WritingContext.Provider value={value}>
      {children}
    </WritingContext.Provider>
  )
}

export function useWriting() {
  const context = useContext(WritingContext)

  if (!context) {
    throw new Error(
      'useWriting must be used inside WritingProvider.',
    )
  }

  return context
}
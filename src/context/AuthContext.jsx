import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from '../services/supabaseClient'
import { getProfile } from '../services/api'

const isSupabaseAuthEnabled = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true'
const PROFILE_CACHE_KEY = 'backoffice_profile_cache_v1'
const PROFILE_REQUEST_TIMEOUT_MS = 8000

const AuthContext = createContext(null)

const normalizeProfile = (profileData, user) => ({
  id: user?.id || profileData?.id || null,
  email: user?.email || profileData?.email || null,
  tenant_id: profileData?.tenant_id || null,
  role: profileData?.role || null,
  is_admin: Boolean(profileData?.is_admin),
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentUserIdRef = useRef(null)
  const initializedRef = useRef(false)

  const writeProfileCache = useCallback((nextProfile) => {
    if (!nextProfile?.id) {
      return
    }

    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile))
    } catch (_error) {
      // ignore cache errors
    }
  }, [])

  const loadCachedProfile = useCallback((userId) => {
    if (!userId) {
      return null
    }

    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY)
      if (!raw) {
        return null
      }

      const parsed = JSON.parse(raw)
      if (parsed?.id === userId) {
        return parsed
      }
      return null
    } catch (_error) {
      return null
    }
  }, [])

  const loadProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      currentUserIdRef.current = null
      setUser(null)
      setProfile(null)
      setError(null)
      return
    }

    currentUserIdRef.current = sessionUser.id
    setUser(sessionUser)
    setError(null)

    const cachedProfile = loadCachedProfile(sessionUser.id)
    if (cachedProfile) {
      setProfile(cachedProfile)
    }

    try {
      const profileData = await Promise.race([
        getProfile(),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error('Profile request timeout')), PROFILE_REQUEST_TIMEOUT_MS)
        }),
      ])
      const nextProfile = normalizeProfile(profileData, sessionUser)
      if (!nextProfile.tenant_id && !nextProfile.is_admin) {
        setError('No se pudo resolver tenant_id para este usuario')
      }
      setProfile(nextProfile)
      writeProfileCache(nextProfile)
    } catch (profileError) {
      if (!isSupabaseAuthEnabled) {
        const fallbackProfile = normalizeProfile(
          {
            is_admin: true,
            role: 'admin',
          },
          sessionUser,
        )
        setProfile(fallbackProfile)
        writeProfileCache(fallbackProfile)
        setError(null)
      } else {
        setProfile(normalizeProfile({}, sessionUser))
        setError(profileError?.response?.data?.error || profileError.message || 'No se pudo cargar el perfil')
      }
    }
  }, [loadCachedProfile, writeProfileCache])

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      setLoading(true)
      try {
        const { user: currentUser } = await getCurrentUser()
        if (!mounted) {
          return
        }

        await loadProfile(currentUser)
      } catch (bootstrapError) {
        if (mounted) {
          setError(bootstrapError.message || 'Error de autenticacion')
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          initializedRef.current = true
          setLoading(false)
        }
      }
    }

    bootstrap()

    const subscription = onAuthStateChange(async (_event, session) => {
      if (!mounted) {
        return
      }

      const nextUser = session?.user || null
      const isSameUser = nextUser?.id && nextUser.id === currentUserIdRef.current
      if (_event === 'TOKEN_REFRESHED' || (_event === 'INITIAL_SESSION' && initializedRef.current && isSameUser) || (_event === 'SIGNED_IN' && isSameUser)) {
        return
      }

      if (!initializedRef.current) {
        setLoading(true)
      }

      try {
        await loadProfile(nextUser)
      } catch (authChangeError) {
        if (mounted) {
          setError(authChangeError?.message || 'No se pudo actualizar la sesion')
        }
      } finally {
        if (mounted) {
          initializedRef.current = true
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    await loadProfile(user)
  }, [loadProfile, user])

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin: Boolean(profile?.is_admin),
      tenantId: profile?.tenant_id || null,
      role: profile?.is_admin ? 'Admin' : profile?.role || null,
      loading,
      error,
      refreshProfile,
    }),
    [user, profile, loading, error, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

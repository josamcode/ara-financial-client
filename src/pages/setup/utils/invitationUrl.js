import { ROUTES } from '@/shared/constants/routes'

export function buildInvitationAcceptUrl(invitation) {
  if (invitation?.acceptUrl) {
    return invitation.acceptUrl
  }

  if (!invitation?.token || typeof window === 'undefined') {
    return ''
  }

  const url = new URL(ROUTES.ACCEPT_INVITE, window.location.origin)
  url.searchParams.set('token', invitation.token)
  return url.toString()
}

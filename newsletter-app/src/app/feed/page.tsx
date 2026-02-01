import { redirect } from 'next/navigation';
import { readAppSession } from '@/lib/session';
import { findUserByAppScopedId } from '@/lib/database';
import { FeedContent } from './FeedContent';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  console.log('DEBUG - FeedPage: Starting feed page render');

  let session;
  try {
    session = readAppSession();
    console.log('DEBUG - FeedPage: Session read result:', {
      hasSession: !!session,
      expiresAt: session?.expiresAt,
      now: Date.now(),
      isExpired: session ? session.expiresAt < Date.now() : 'no session',
    });
  } catch (error) {
    console.error('DEBUG - FeedPage: Session read failed:', error);
    redirect('/');
  }

  // Redirect to home if not logged in
  if (!session || session.expiresAt < Date.now()) {
    console.log('DEBUG - FeedPage: Redirecting due to invalid session');
    redirect('/');
  }

  // Get user data (with error handling for database connection)
  let user: any = null;
  try {
    user = await findUserByAppScopedId(session.userId);
  } catch (error) {
    console.error('Database error in feed page:', error);
    // Continue without user data - the app can still function
  }

  // Build travel profile from presets
  console.log('DEBUG - FeedPage: Building travel profile from session:', {
    presets: session.presets,
    isFrequentTraveler: session.isFrequentTraveler,
  });

  const hasHotelMembership = session.presets.includes('has_hotel_membership');
  const hasAirlineMembership = session.presets.includes('has_airline_membership');
  const isFrequentTraveler = session.isFrequentTraveler ?? (hasHotelMembership && hasAirlineMembership);

  console.log('DEBUG - FeedPage: About to render FeedContent component');

  return (
    <FeedContent
      session={{
        userId: session.userId,
        humanityUserId: session.humanityUserId,
        email: session.email,
        evmAddress: session.evmAddress,
        linkedSocials: session.linkedSocials,
        presets: session.presets,
      }}
      user={
        user
          ? {
              linkedSocials: user.linkedSocials,
              presets: user.presets,
              travelProfile: {
                hasHotelMembership,
                hasAirlineMembership,
                isFrequentTraveler,
              },
              email: session.email,
              evmAddress: session.evmAddress,
            }
          : null
      }
    />
  );
}


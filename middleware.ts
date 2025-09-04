import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Allow access to public routes
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return res;
  }

  // If user is not authenticated and tries to access a protected route, redirect to login
  if (!session && !user && pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set(`redirectedFrom`, pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and tries to access login, redirect to dashboard
  if ((session || user) && pathname === '/login') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Fetch user profile to check role for role-based access
  if (session && user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      console.error('Error fetching profile in middleware:', error);
      // If profile cannot be fetched, consider it an unauthorized access or an error state
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based redirection for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (profile.role === 'abogado' && !pathname.startsWith('/dashboard/lawyer')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard/lawyer';
        return NextResponse.redirect(redirectUrl);
      }
      if (profile.role === 'admin' && !pathname.startsWith('/dashboard/admin')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard/admin';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portal_url: string }> }
) {
  const { portal_url } = await params;

  try {
    // Fetch manifest from backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/restaurants/portal/${portal_url}/manifest.json`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch manifest');
    }

    const manifest = await response.json();

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching portal manifest:', error);

    // Return a fallback manifest
    return NextResponse.json(
      {
        name: 'amazooh.com Platform',
        short_name: 'amazooh.com',
        description: 'Order your favorite meals online',
        start_url: `/${portal_url}/customer`,
        scope: `/${portal_url}/`,
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#1e40af',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        categories: ['food', 'shopping'],
      },
      {
        headers: {
          'Content-Type': 'application/manifest+json',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }
}

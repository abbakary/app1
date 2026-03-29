import { Metadata, MetadataRoute, Viewport } from 'next';

interface Props {
  children: React.ReactNode;
  params: Promise<{ portal_url: string }>;
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
    themeColor: [
      {
        media: '(prefers-color-scheme: light)',
        color: '#ffffff',
      },
      {
        media: '(prefers-color-scheme: dark)',
        color: '#000000',
      },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { portal_url } = await params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/restaurants/portal/${portal_url}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      // Return default metadata instead of throwing
      return {
        title: 'Restaurant Portal',
        description: 'Online ordering portal',
      };
    }

    const restaurant = await response.json();

    return {
      title: `${restaurant.name} - Order Online | amazooh.com`,

      description: `Order your favorite meals from ${restaurant.name}. Fast, Fresh, Delivered to You.`,
      manifest: `/${portal_url}/manifest.json`,
      appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: restaurant.name,
      },
      formatDetection: {
        telephone: false,
      },
      openGraph: {
        title: `${restaurant.name} - Order Online`,
        description: `Order your favorite meals from ${restaurant.name}`,
        type: 'website',
        images: restaurant.logo_url
          ? [
            {
              url: restaurant.logo_url.startsWith('/')
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${restaurant.logo_url}`
                : restaurant.logo_url,
              width: 512,
              height: 512,
            },
          ]
          : [],
      },
    };
  } catch (error) {
    console.error('Error fetching restaurant metadata:', error);

    return {
      title: 'amazooh.com - Order Online',

      description: 'Order your favorite meals online',
      manifest: `/${portal_url}/manifest.json`,
    };
  }
}

export default async function PortalLayout({ children, params }: Props) {
  return <>{children}</>;
}

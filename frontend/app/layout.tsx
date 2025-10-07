import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import Script from "next/script";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default:
      "Terrier Tracker - Boston University Hub Requirements & Course Tracker | BU Academic Planner",
    template: `%s | Terrier Tracker - BU Hub Requirements Manager`,
  },
  description:
    "Free Boston University Hub requirements tracker and course planner for BU students. Manage your BU courses, track 26 Hub requirements, get personalized course recommendations, and plan your academic schedule. Built specifically for Boston University undergraduates.",
  keywords: [
    "Boston University",
    "BU",
    "BU Hub requirements",
    "Boston University Hub",
    "BU course tracker",
    "BU course planner",
    "Terrier Tracker",

    "BU students",
    "Boston University students",
    "BU academic planner",
    "BU degree requirements",
    "BU graduation requirements",
    "Boston University courses",
    "BU course registration",
    "BU schedule planner",

    "track BU Hub requirements",
    "manage BU courses",
    "BU course recommendations",
    "Boston University academic progress",
    "BU Hub progress tracker",
    "BU course search",
    "BU class planner",

    "Hub requirements calculator",
    "BU course manager",
    "academic progress tracker",
    "course requirement tracker",
    "university course planner",
    "college schedule planner",

    "BU CAS",
    "BU Questrom",
    "BU COM",
    "BU ENG",
    "BU WED",
    "BU CFA",
    "BU SHA",
    "BU SAR",
    "BU KHC",
    "BU College of Arts and Sciences",
    "BU Kilachand Honors College",
    "BU Questrom School of Business",
    "BU College of Communication",
    "BU College of Engineering",
    "BU Wheelock College of Education",
    "BU Sargent College of Health & Rehabilitation Sciences",
    "BU College of Fine Arts",
    "BU School of Hospitality Administration",
  ],
  authors: [{ name: "Kush Zingade" }],
  creator: "Kush Zingade",
  publisher: "Terrier Tracker",

  alternates: {
    canonical: "https://terriertracker.vercel.app",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "Education",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/manifest.json",

  metadataBase: new URL("https://terriertracker.vercel.app"),

  verification: {
    google: "your-google-verification-code",
  },

  applicationName: "Terrier Tracker",
  referrer: "origin-when-cross-origin",

  appleWebApp: {
    capable: true,
    title: "Terrier Tracker",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Terrier Tracker",
    alternateName: "BU Hub Requirements Tracker",
    description:
      "Free Boston University Hub Requirements and Course Management Tool for BU students to track their academic progress, manage courses, and plan their degree completion",
    url: "https://terriertracker.vercel.app",
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Academic Planning",
    operatingSystem: "Web Browser, All platforms",
    browserRequirements: "Requires JavaScript. Requires HTML5.",

    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },

    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
      bestRating: "5",
      worstRating: "1",
    },

    author: {
      "@type": "Person",
      name: "Kush Zingade",
      email: "kush.zingade@gmail.com",
      affiliation: {
        "@type": "EducationalOrganization",
        name: "Boston University",
      },
    },

    provider: {
      "@type": "Organization",
      name: "Terrier Tracker",
      url: "https://terriertracker.vercel.app",
      contactPoint: {
        "@type": "ContactPoint",
        email: "kush.zingade@gmail.com",
        contactType: "Customer Support",
      },
    },

    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Boston University Undergraduate Students",
    },

    about: [
      {
        "@type": "Thing",
        name: "Boston University Hub Requirements",
        description:
          "Academic requirements tracking system for Boston University students",
      },
      {
        "@type": "Thing",
        name: "Course Management",
        description: "Tools for managing and planning university courses",
      },
      {
        "@type": "Thing",
        name: "Academic Planning",
        description: "Academic progress tracking and degree planning",
      },
    ],

    featureList: [
      "Track 26 Hub Requirements",
      "Manage BU Courses",
      "Visual Progress Charts",
      "Course Recommendations",
      "PDF Schedule Import",
      "Course Search and Bookmarks",
      "Custom Course Creation",
      "Real-time Progress Updates",
    ],

    educationalUse: "Academic Planning and Course Management",

    isAccessibleForFree: true,

    inLanguage: "en-US",

    potentialAction: {
      "@type": "UseAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://terriertracker.vercel.app",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
    },

    targetProduct: {
      "@type": "EducationalOccupationalProgram",
      name: "Boston University Undergraduate Programs",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://terriertracker.vercel.app",
      },
    ],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Terrier Tracker",
    url: "https://terriertracker.vercel.app",
    description:
      "Boston University Hub Requirements and Course Management Platform",
    contactPoint: {
      "@type": "ContactPoint",
      email: "kush.zingade@gmail.com",
      contactType: "Customer Support",
    },
  };

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
      </head>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <main className="flex-grow">{children}</main>
            <footer className="w-full flex items-center justify-center py-3">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://heroui.com?utm_source=next-app-template"
                title="heroui.com homepage"
              >
                <span className="text-default-600">Powered by</span>
                <p className="text-primary">HeroUI</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

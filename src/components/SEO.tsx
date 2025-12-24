import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

export default function SEO({
    title,
    description,
    name = 'Collabio',
    type = 'website',
    image = '/logo.jpg', // Default fallback image from public folder
    url
}: SEOProps) {
    const siteTitle = title ? `${title} | ${name}` : name;
    const metaDescription = description || 'Propojujeme firmy s influencery a tvůrci obsahu. Najděte perfektní spolupráci pro vaši značku na Collabio.';
    const siteUrl = url || window.location.href;
    const siteImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name='description' content={metaDescription} />
            <link rel="canonical" href={siteUrl} />

            {/* Facebook / Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={siteImage} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:site_name" content={name} />

            {/* Twitter tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={siteImage} />
        </Helmet>
    );
}

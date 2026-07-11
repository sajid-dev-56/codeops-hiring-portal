import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/careers'],
      disallow: ['/admin/', '/candidate/'],
    },
    sitemap: 'https://codeopspro.vercel.app/sitemap.xml',
  }
}

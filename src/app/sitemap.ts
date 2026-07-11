import { MetadataRoute } from 'next'
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    select: { slug: true, updatedAt: true },
  })

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `https://codeopspro.vercel.app/careers/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://codeopspro.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://codeopspro.vercel.app/careers',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...jobEntries,
  ]
}

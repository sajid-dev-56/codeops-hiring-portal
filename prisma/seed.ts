import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@hiringportal.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

  const hashedPassword = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { hashedPassword, role: "ADMIN" },
    create: {
      email: adminEmail,
      hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user seeded: ${adminEmail}`);

  // Seed sample jobs
  const jobs = [
    {
      title: "Senior Frontend Engineer",
      slug: "senior-frontend-engineer",
      department: "Engineering",
      status: "OPEN" as const,
      priority: "HIGH" as const,
      headcount: 2,
      description: `## About the Role\n\nWe're looking for a Senior Frontend Engineer to join our growing team. You'll be building beautiful, performant user interfaces using React, Next.js, and TypeScript.\n\n## Responsibilities\n\n- Design and implement new user-facing features\n- Build reusable components and libraries\n- Optimize applications for maximum performance\n- Collaborate with designers and backend engineers\n- Mentor junior developers\n\n## Requirements\n\n- 5+ years of experience with React/Next.js\n- Strong TypeScript skills\n- Experience with state management (Redux, Zustand)\n- Familiarity with testing frameworks (Jest, Cypress)\n- Excellent communication skills`,
    },
    {
      title: "Product Designer",
      slug: "product-designer",
      department: "Design",
      status: "OPEN" as const,
      priority: "MEDIUM" as const,
      headcount: 1,
      description: `## About the Role\n\nWe're seeking a talented Product Designer to help shape the future of our products. You'll work closely with product managers and engineers to create intuitive, beautiful experiences.\n\n## Responsibilities\n\n- Create wireframes, prototypes, and high-fidelity designs\n- Conduct user research and usability testing\n- Develop and maintain our design system\n- Collaborate cross-functionally with engineering and product\n\n## Requirements\n\n- 3+ years of product design experience\n- Proficiency in Figma\n- Strong portfolio demonstrating UX problem-solving\n- Experience with design systems\n- Understanding of frontend development`,
    },
    {
      title: "DevOps Engineer",
      slug: "devops-engineer",
      department: "Infrastructure",
      status: "OPEN" as const,
      priority: "URGENT" as const,
      headcount: 1,
      description: `## About the Role\n\nJoin our infrastructure team to build and maintain our cloud platform. You'll design scalable, reliable systems that power our applications.\n\n## Responsibilities\n\n- Design and manage CI/CD pipelines\n- Manage Kubernetes clusters and cloud infrastructure\n- Implement monitoring and alerting systems\n- Automate infrastructure provisioning\n- Ensure system reliability and security\n\n## Requirements\n\n- 4+ years of DevOps/SRE experience\n- Strong knowledge of AWS or GCP\n- Experience with Kubernetes and Docker\n- Proficiency in Terraform or Pulumi\n- Scripting skills (Python, Bash)`,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: {
        ...job,
        targetStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✅ ${jobs.length} sample jobs seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export interface ProjectOptions {
	projectName: string;
	frontendFramework: "React" | "Next.js" | "Remix";
	frontendLanguage: "JavaScript" | "TypeScript";
	orm: "Prisma" | "Drizzle";
	database: "PostgreSQL" | "MySQL";
	authentication: "Hard-coded" | "NextAuth" | "Lucia Auth";
	installDeps: boolean;
}

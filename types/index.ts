export interface ProjectOptions {
	projectName: string;
	frontendFramework: "React" | "Next.js" | "Remix";
	frontendLanguage: "JavaScript" | "TypeScript";
	orm: "None" | "Prisma" | "Drizzle";
	database: "None" | "PostgreSQL" | "MySQL";
	authentication: "None" | "Hard-coded" | "NextAuth" | "Lucia Auth";
	installDeps: boolean;
}

import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { PKG_ROOT } from "../consts";

export interface PrismaOptions {
	projectPath: string;
	orm: "None" | "Prisma" | "Drizzle";
	database: "None" | "PostgreSQL" | "MySQL";
	authentication: "None" | "Hard-coded" | "NextAuth" | "Lucia Auth";
	prismasrcpath: string;
}

async function setupPrisma({
	projectPath,
	orm,
	database,
	authentication,
	prismasrcpath,
}: PrismaOptions) {
	const spinner = ora();

	// Check if Prisma should be installed based on the options
	if (orm === "Prisma") {
		spinner.start("Setting up Prisma...");

		const prismaSchemaSrcPath = path.join(
			PKG_ROOT,
			"templates/extras/prisma/schema",
			prismasrcpath
		);

		const packageJsonPath = path.join(projectPath, "package.json");
		//changing the database according to provider
		let prismaSchema = await fs.readFileSync(prismaSchemaSrcPath, "utf-8");

		prismaSchema = prismaSchema.replace(
			'provider = "postgresql"',
			`provider = "${database === "MySQL" ? "mysql" : "postgresql"}"`
		);

		const schemaDest = path.join(projectPath, "prisma/schema.prisma");
		fs.mkdirSync(path.dirname(schemaDest), { recursive: true });
		fs.writeFileSync(schemaDest, prismaSchema);

		spinner.succeed(
			chalk.green("Successfully copied Prisma Schema Files.")
		);

		// Update package.json with Prisma dependencies
		try {
			const packageJson = await fs.readJson(packageJsonPath);
			packageJson.dependencies = {
				...packageJson.dependencies,
				prisma: "^4.0.0",
				"@prisma/client": "^4.0.0",
			};
			if (authentication === "NextAuth") {
				packageJson.dependencies = {
					...packageJson.dependencies,
					"next-auth": "4.24.10",
					bcrypt: "5.1.0",
				};

				packageJson.devDependencies = {
					...packageJson.devDependencies,
					"@types/bcrypt": "5.0.0",
				};
			}
			await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
		} catch (error) {
			spinner.fail(
				chalk.red(
					"Failed to update package.json with Prisma dependencies."
				)
			);
			console.error(error);
			return;
		}

		spinner.succeed(
			chalk.green(`Successfully setup ${database} database service.`)
		);
	} else {
		console.log(
			chalk.yellow("Prisma setup skipped based on selected options.")
		);
	}
}

export { setupPrisma };

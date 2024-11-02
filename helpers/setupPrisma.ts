import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";

async function setupPrisma(
	projectPath: string,
	orm: string,
	database: string,

	prismasrcpath: string
) {
	const spinner = ora();

	// Check if Prisma should be installed based on the options
	if (orm === "Prisma" && database === "PostgreSQL") {
		spinner.start("Setting up Prisma...");

		// Define paths for the Prisma schema and package.json
		const prismaSchemaSrcPath = path.join(
			"templates",
			"extras",
			"prisma",
			"schema",
			prismasrcpath
		);
		const prismaSchemaDestPath = path.join(
			projectPath,
			"prisma",
			"schema.prisma"
		);
		const packageJsonPath = path.join(projectPath, "package.json");

		// Ensure the prisma directory exists and copy the schema file
		await fs.ensureDir(path.dirname(prismaSchemaDestPath));
		await fs.copyFile(prismaSchemaSrcPath, prismaSchemaDestPath);
		spinner.succeed(chalk.green("Prisma schema file copied."));

		// Update package.json with Prisma dependencies
		try {
			const packageJson = await fs.readJson(packageJsonPath);
			packageJson.dependencies = {
				...packageJson.dependencies,
				prisma: "^4.0.0",
				"@prisma/client": "^4.0.0",
			};
			await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
			spinner.succeed(
				chalk.green("Updated package.json with Prisma dependencies.")
			);
		} catch (error) {
			spinner.fail(
				chalk.red(
					"Failed to update package.json with Prisma dependencies."
				)
			);
			console.error(error);
			return;
		}

		spinner.succeed(chalk.green("Prisma setup complete."));
	} else {
		console.log(
			chalk.yellow("Prisma setup skipped based on selected options.")
		);
	}
}

export { setupPrisma };

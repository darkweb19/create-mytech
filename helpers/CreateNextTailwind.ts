import fs from "fs-extra";
import path from "path";
import ora from "ora";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";
import { ProjectOptions } from "../src";
import { setupPrisma } from "./setupPrisma";
import { PKG_ROOT } from "../consts";

async function createNextTailwindBoilerplate(
	projectPath: string,
	options: ProjectOptions
) {
	const { orm, database, authentication, frontendLanguage } = options;
	const spinner = ora();

	spinner.start(
		"Setting up Next.js + Tailwind CSS project from template files..."
	);

	await fs.copySync(
		path.join(PKG_ROOT, "templates/next-tailwind"),
		projectPath
	);
	spinner.succeed(chalk.green("Template files copied."));

	// Prompt for dependency installation
	const { installDeps } = await inquirer.prompt([
		{
			type: "confirm",
			name: "installDeps",
			message: "Do you want to install the dependencies now?",
			default: true,
		},
	]);

	if (authentication === "Hard-coded" && orm === "Prisma") {
		setupPrisma({
			projectPath,
			orm,
			database,
			authentication,
			prismasrcpath: "hard-coded.prisma",
		});
	}

	if (authentication === "NextAuth" && orm === "Prisma") {
		setupPrisma({
			projectPath,
			orm,
			database,
			authentication,
			prismasrcpath: "next-auth.prisma",
		});

		spinner.succeed(
			chalk.green("Updated package.json with Prisma dependencies.")
		);
	}

	if (installDeps) {
		spinner.start("Installing dependencies...");
		execSync("npm install", { cwd: projectPath, stdio: "inherit" });
		spinner.succeed(chalk.green("Dependencies installed."));
	} else {
		console.log(
			"You can install dependencies later by running 'npm install' inside the 'app' directory."
		);
	}

	console.log(
		chalk.green("Next.js with Tailwind CSS boilerplate setup complete!")
	);
}

export { createNextTailwindBoilerplate };

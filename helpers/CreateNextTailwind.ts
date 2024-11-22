import fs from "fs-extra";
import path from "path";
import ora from "ora";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";
import { ProjectOptions } from "../types";
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

	if (authentication === "NextAuth") {
		await fs.copySync(
			path.join(PKG_ROOT, "templates/next-tailwind"),
			projectPath
		);

		await fs.remove(path.join(projectPath, "app"));

		await fs.copySync(
			path.join(PKG_ROOT, "templates/extras/app-with-auth"),
			projectPath
		);

		chalk.green("Template files copied with NextAuth.");

		{
			orm === "Prisma" &&
				setupPrisma({
					projectPath,
					orm,
					database,
					authentication,
					prismasrcpath: "next-auth.prisma",
				});
		}
	} else if (authentication === "Hard-coded") {
		await fs.copySync(
			path.join(PKG_ROOT, "templates/next-tailwind"),
			projectPath
		);

		{
			orm === "Prisma" &&
				setupPrisma({
					projectPath,
					orm,
					database,
					authentication,
					prismasrcpath: "hard-coded.prisma",
				});
		}

		spinner.succeed(
			chalk.green("Template files copied with Hard-Coded Authentication.")
		);
	}

	spinner.succeed(
		chalk.green("Updated package.json with Prisma dependencies.")
	);

	// Prompt for dependency installation
	const { installDeps } = await inquirer.prompt([
		{
			type: "confirm",
			name: "installDeps",
			message: "Do you want to install the dependencies now?",
			default: true,
		},
	]);

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

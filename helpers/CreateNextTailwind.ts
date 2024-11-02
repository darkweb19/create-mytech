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

	// const templatePath = path.join("templates/next-tailwind");

	// await fs.ensureDir(templatePath);

	spinner.start(
		"Setting up Next.js + Tailwind CSS project from template files..."
	);

	fs.copySync(path.join(PKG_ROOT, "templates/next-tailwind"), projectPath);
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

	// if (authentication === "Hard-coded") {
	// 	setupPrisma(projectPath, orm, database, "hard-coded.prisma");
	// }

	// if (authentication === "NextAuth") {
	// 	setupPrisma(projectPath, orm, database, "next-auth.prisma");
	// }

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

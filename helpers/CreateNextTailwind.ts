import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { execSync } from "child_process";
import { ProjectOptions } from "../types";
import { setupPrisma } from "./setupPrisma";
import { PKG_ROOT } from "../consts";

async function createNextTailwindBoilerplate(
	projectPath: string,
	options: ProjectOptions
) {
	const { orm, database, authentication, installDeps } = options;
	const spinner = ora();

	// Configuration for different authentication types
	const authConfig = {
		NextAuth: {
			templatePath: "templates/extras/app-with-auth",
			prismasrcpath: "next-auth.prisma",
			message: "Template files copied with NextAuth.",
		},
		"Hard-coded": {
			templatePath: "templates/extras/app-with-hard-coded",
			prismasrcpath: "hard-coded.prisma",
			message: "Template files copied with Hard-Coded Authentication.",
		},
		None: {
			templatePath: null, // No additional template required
			prismasrcpath: null,
			message: "Template files copied with No Authentication.",
		},
	};

	try {
		// Start spinner
		spinner.start(
			"Setting up Next.js + Tailwind CSS project from template files..."
		);

		// Base template copy
		await fs.copySync(
			path.join(PKG_ROOT, "templates/next-tailwind"),
			projectPath
		);

		// Get the authentication configuration
		const auth = authConfig[authentication];
		if (!auth) {
			throw new Error(
				`Unsupported authentication type: ${authentication}`
			);
		}

		// this is for package.json setup
		if (auth.templatePath) {
			if (authentication === "NextAuth") {
				const packageJsonPath = path.join(projectPath, "package.json");
				const packageJson = await fs.readJson(packageJsonPath);

				packageJson.dependencies = {
					...packageJson.dependencies,
					"next-auth": "4.24.10",
					bcrypt: "5.1.0",
				};
				packageJson.devDependencies = {
					...packageJson.devDependencies,
					"@types/bcrypt": "5.0.0",
				};

				await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
			}

			if (authentication === "Hard-coded") {
				const packageJsonPath = path.join(projectPath, "package.json");
				const packageJson = await fs.readJson(packageJsonPath);

				packageJson.dependencies = {
					...packageJson.dependencies,
					bcryptjs: "^2.4.3",
					"@nextui-org/react": "^2.2.10",
					"@radix-ui/react-avatar": "^1.0.4",
					"@radix-ui/react-dialog": "^1.0.5",
					"@radix-ui/react-dropdown-menu": "^2.0.6",
					"@radix-ui/react-label": "^2.0.2",
					"@radix-ui/react-scroll-area": "^1.0.5",
					"@radix-ui/react-slot": "^1.0.2",
					axios: "^1.6.8",
					"react-hot-toast": "^2.4.1",
					"tailwindcss-animate": "^1.0.7",
					"class-variance-authority": "^0.7.0",
					"framer-motion": "^11.0.22",
					jsonwebtoken: "^9.0.2",
					"lucide-react": "^0.365.0",
					nodemailer: "^6.9.12",
				};
				packageJson.devDependencies = {
					...packageJson.devDependencies,
					"@types/jsonwebtoken": "^9.0.6",
				};

				await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
			}

			await fs.copySync(
				path.join(PKG_ROOT, auth.templatePath),
				projectPath
			);
			// Success message for authentication type
			spinner.succeed(chalk.green(auth.message));
		}

		// Prisma setup if ORM is Prisma and authentication is configured
		if (orm === "Prisma" && auth.prismasrcpath) {
			if (database === "None") {
				console.log(
					chalk.red(
						"Prisma requires a valid database. So the default is selected."
					)
				);
			}

			await setupPrisma({
				projectPath,
				orm,
				database,
				authentication,
				prismasrcpath: auth.prismasrcpath,
			});
		}

		// Install dependencies if the flag is set
		if (installDeps) {
			spinner.start("Installing dependencies...");
			execSync("npm install", { cwd: projectPath, stdio: "inherit" });
			spinner.succeed(chalk.green("Dependencies installed."));
		} else {
			console.log(
				chalk.bgYellowBright(
					"You can install dependencies later by running 'npm install' inside the project directory."
				)
			);
		}

		console.log(
			chalk.green("Next.js with Tailwind CSS boilerplate setup complete!")
		);
	} catch (error) {
		spinner.fail(chalk.red("An error occurred during the setup process."));
		console.error(error.message);
	}
}

export { createNextTailwindBoilerplate };

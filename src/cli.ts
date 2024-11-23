import { Command } from "commander";
import path from "path";
import { ProjectOptions } from "../types";
import inquirer from "inquirer";

const program = new Command();

const default_for_cli = {
	projectName: "default-project",
	frontendFramework: false,
	frontendLanguage: false,
	orm: false,
	database: false,
	authentication: false,
	installDeps: false,
};

const DEFAULT_OPTIONS = {
	projectName: "default-project",
	frontendFramework: "None",
	frontendLanguage: "None",
	orm: "None",
	database: "None",
	authentication: "None",
	installDeps: true,
};

export const cli = async (): Promise<ProjectOptions> => {
	// Parse command-line arguments
	program
		.argument("[projectName]", "Name of the project")
		.option(
			"-f, --frontend <framework>",
			"Frontend framework",
			default_for_cli.frontendFramework
		)
		.option(
			"-l, --language <language>",
			"Frontend language",
			default_for_cli.frontendLanguage
		)
		.option(
			"-o, --orm <orm>",
			"ORM for database interaction",
			default_for_cli.orm
		)
		.option(
			"-d, --database <database>",
			"Database",
			default_for_cli.database
		)
		.option(
			"-a, --auth <auth>",
			"Authentication type",
			default_for_cli.authentication
		)
		.option(
			"-i, --install",
			"Install Dependencies",
			default_for_cli.installDeps
		)
		.parse(process.argv);

	const projectNameArg = program.args[0];

	// Determine the project name based on the argument
	const projectName =
		projectNameArg === "./" || projectNameArg === "."
			? path.basename(process.cwd())
			: projectNameArg;

	const options = program.opts();

	const questions: any = [];

	if (!projectNameArg) {
		questions.push({
			type: "input",
			name: "projectName",
			message: "Enter your project name:",
			default: DEFAULT_OPTIONS.projectName,
		});
	}

	if (!options.frontend) {
		questions.push({
			type: "list",
			name: "frontendFramework",
			message: "Select a frontend framework:",
			choices: ["React", "Next.js", "Remix"],
			default: DEFAULT_OPTIONS.frontendFramework,
		});
		console.log("options frontend is added on the question array");
	}

	if (!options.language) {
		questions.push({
			type: "list",
			name: "frontendLanguage",
			message: "Choose language for frontend:",
			choices: ["JavaScript", "TypeScript"],
			default: DEFAULT_OPTIONS.frontendLanguage,
		});
	}

	if (!options.orm) {
		questions.push({
			type: "list",
			name: "orm",
			message: "Choose an ORM for database interaction:",
			choices: ["None", "Prisma", "Drizzle"],
			default: DEFAULT_OPTIONS.orm,
		});
	}

	if (!options.database) {
		questions.push({
			type: "list",
			name: "database",
			message: "Select a database:",
			choices: ["None", "PostgreSQL", "MySQL"],
			default: DEFAULT_OPTIONS.database,
		});
	}

	if (!options.auth) {
		questions.push({
			type: "list",
			name: "authentication",
			message: "Select authentication type:",
			choices: ["None", "Hard-coded", "NextAuth", "Lucia Auth"],
			default: DEFAULT_OPTIONS.authentication,
		});
	}
	if (!options.install) {
		questions.push({
			type: "confirm",
			name: "installDeps",
			message: "Do you want to install the dependencies now?",
			default: DEFAULT_OPTIONS.installDeps,
		});
	}

	const answers = await inquirer.prompt(questions);

	// Merge command-line options with answers from inquirer
	const finalAnswers: ProjectOptions = {
		projectName: projectName ? projectName : answers.projectName,
		frontendFramework: answers.frontendFramework,
		frontendLanguage: answers.frontendLanguage,
		orm: answers.orm,
		database: answers.database,
		authentication: answers.authentication,
		installDeps: answers.installDeps,
	};

	return finalAnswers;
};

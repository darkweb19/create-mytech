#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import { Command } from "commander";
import path from "path";
import { createMERNBoilerplate } from "../helpers/CreateMERN";
import { createNextTailwindBoilerplate } from "../helpers/CreateNextTailwind";
import { ProjectOptions } from "../types";

const program = new Command();

const DEFAULT_OPTIONS = {
	projectName: "default-project",
	frontendFramework: "None",
	frontendLanguage: "None",
	orm: "None",
	database: "None",
	authentication: "None",
};

// Create an object that maps frontend frameworks to their respective setup functions
const setupFunctions: Record<
	ProjectOptions["frontendFramework"],
	(projectPath: string, options: ProjectOptions) => Promise<void>
> = {
	React: createMERNBoilerplate,
	"Next.js": createNextTailwindBoilerplate,
	Remix: async (projectPath, options) => {
		// Add Remix-specific setup logic here when needed
		console.log("Setting up Remix project...");
	},
};

async function init() {
	console.log(chalk.green("Welcome to My Stack Generator!"));

	// Parse command-line arguments
	program
		.argument("[projectName]", "Name of the project")
		.option(
			"-f, --frontend <framework>",
			"Frontend framework",
			DEFAULT_OPTIONS.frontendFramework
		)
		.option(
			"-l, --language <language>",
			"Frontend language",
			DEFAULT_OPTIONS.frontendLanguage
		)
		.option(
			"-o, --orm <orm>",
			"ORM for database interaction",
			DEFAULT_OPTIONS.orm
		)
		.option(
			"-d, --database <database>",
			"Database",
			DEFAULT_OPTIONS.database
		)
		.option(
			"-a, --auth <auth>",
			"Authentication type",
			DEFAULT_OPTIONS.authentication
		)
		.parse(process.argv);

	const projectNameArg = program.args[0];

	// Determine the project name based on the argument
	const projectName =
		projectNameArg === "./" || projectNameArg === "."
			? path.basename(process.cwd())
			: projectNameArg || DEFAULT_OPTIONS.projectName;

	const options = program.opts();

	const questions: any = [];

	if (!projectNameArg) {
		questions.push({
			type: "input",
			name: "projectName",
			message: "Enter your project name:",
			default: projectName,
		});
	}

	if (options.frontend === DEFAULT_OPTIONS.frontendFramework) {
		questions.push({
			type: "list",
			name: "frontendFramework",
			message: "Select a frontend framework:",
			choices: ["React", "Next.js", "Remix"],
			default: DEFAULT_OPTIONS.frontendFramework,
		});
		console.log("options frontend is added on the question array");
	}

	if (options.language === DEFAULT_OPTIONS.frontendLanguage) {
		questions.push({
			type: "list",
			name: "frontendLanguage",
			message: "Choose language for frontend:",
			choices: ["JavaScript", "TypeScript"],
			default: DEFAULT_OPTIONS.frontendLanguage,
		});
	}

	if (options.orm === DEFAULT_OPTIONS.orm) {
		questions.push({
			type: "list",
			name: "orm",
			message: "Choose an ORM for database interaction:",
			choices: ["Prisma", "Drizzle"],
			default: DEFAULT_OPTIONS.orm,
		});
	}

	if (options.database === DEFAULT_OPTIONS.database) {
		questions.push({
			type: "list",
			name: "database",
			message: "Select a database:",
			choices: ["PostgreSQL", "MySQL"],
			default: DEFAULT_OPTIONS.database,
		});
	}

	if (options.auth === DEFAULT_OPTIONS.authentication) {
		questions.push({
			type: "list",
			name: "authentication",
			message: "Select authentication type:",
			choices: ["Hard-coded", "NextAuth", "Lucia Auth"],
			default: DEFAULT_OPTIONS.authentication,
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
	};
	createProject(finalAnswers);
}

async function createProject(answers: ProjectOptions) {
	const projectPath = path.join(process.cwd(), answers.projectName);
	await fs.ensureDir(projectPath);

	// Retrieve the setup function based on the frontend framework and call it
	const setupFunction = setupFunctions[answers.frontendFramework];
	await setupFunction(projectPath, answers);

	console.log(
		chalk.green(
			`Project ${answers.projectName} created with ${answers.frontendFramework} frontend and backend!`
		)
	);
}

init();

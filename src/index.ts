#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { createMERNBoilerplate } from "../helpers/CreateMERN";
import { createNextTailwindBoilerplate } from "../helpers/CreateNextTailwind";

export interface ProjectOptions {
	projectName: string;
	frontendFramework: "React" | "Next.js" | "Remix";
	frontendLanguage: "JavaScript" | "TypeScript";
	orm: "Prisma" | "Drizzle";
	database: "PostgreSQL" | "MySQL" | "PlanetScale";
	authentication: "Hard-coded" | "NextAuth" | "Lucia Auth";
}

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

	const answers: ProjectOptions = await inquirer.prompt([
		{
			type: "input",
			name: "projectName",
			message: "Enter your project name:",
		},
		{
			type: "list",
			name: "frontendFramework",
			message: "Select a frontend framework:",
			choices: ["React", "Next.js", "Remix"],
		},
		{
			type: "list",
			name: "frontendLanguage",
			message: "Choose language for frontend:",
			choices: ["JavaScript", "TypeScript"],
		},
		{
			type: "list",
			name: "backendFramework",
			message: "Select a backend framework:",
			choices: ["Node.js with Express"],
		},
		{
			type: "list",
			name: "orm",
			message: "Choose an ORM for database interaction:",
			choices: ["Prisma", "Drizzle"],
		},
		{
			type: "list",
			name: "database",
			message: "Select a database:",
			choices: ["PostgreSQL", "MySQL", "PlanetScale"],
		},
		{
			type: "list",
			name: "authentication",
			message: "Select authentication type:",
			choices: ["Hard-coded", "NextAuth", "Lucia Auth"],
		},
	]);

	createProject(answers);
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

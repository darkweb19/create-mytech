#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { createMERNBoilerplate } from "../helpers/CreateMERN";

async function init() {
	console.log(chalk.green("Welcome to My Stack Generator!"));

	const answers = await inquirer.prompt([
		{
			type: "list",
			name: "stack",
			message: "Choose your stack:",
			choices: ["MERN", "Next.js"],
		},
		{
			type: "input",
			name: "projectName",
			message: "Enter your project name:",
		},
	]);

	createProject(answers.projectName, answers.stack);
}

async function createProject(projectName: string, stack: string) {
	const projectPath = path.join(process.cwd(), projectName);
	await fs.ensureDir(projectPath);

	switch (stack) {
		case "MERN":
			await createMERNBoilerplate(projectPath);
			break;
		case "Next.js":
			await createNextTailwindBoilerplate(projectPath);
			break;
	}

	console.log(
		chalk.green(`Project ${projectName} created with ${stack} stack!`)
	);
}

async function createNextTailwindBoilerplate(projectPath: string) {
	// Set up Next.js + Tailwind boilerplate here
}

init();

#!/usr/bin/env node

import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { createMERNBoilerplate } from "../helpers/CreateMERN";
import { createNextTailwindBoilerplate } from "../helpers/CreateNextTailwind";
import { ProjectOptions } from "../types";
import { cli } from "./cli";
import { logger } from "../utils/logger";
import { title_text_ASCII } from "../consts";

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
	logger.info(title_text_ASCII);

	// Parse command-line arguments
	const finalAnswers = await cli();

	createProject(finalAnswers);
}

async function createProject(answers: ProjectOptions) {
	const projectPath = path.join(process.cwd(), answers.projectName);
	await fs.ensureDir(projectPath);

	// Retrieve the setup function based on the frontend framework and call it
	const setupFunction = setupFunctions[answers.frontendFramework];
	await setupFunction(projectPath, answers);

	logger.info(`Successfully created your project at ${projectPath}`);

	//! Log next step is required
	logger.info("Next Steps:");
}

init();

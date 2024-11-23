import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { execSync } from "child_process";
import chalk from "chalk";
import { ProjectOptions } from "../types";

async function createMERNBoilerplate(
	projectPath: string,
	answers: ProjectOptions
) {
	const { installDeps } = answers;
	const spinner = ora();

	const serverPath = path.join(projectPath, "server");
	const clientPath = path.join(projectPath, "client");
	const srcPath = path.join(clientPath, "src");

	await fs.ensureDir(serverPath);
	await fs.ensureDir(clientPath);
	await fs.ensureDir(srcPath);

	spinner.start("Creating package.json for backend...");
	await createPackageJson(serverPath, "server");
	spinner.succeed(chalk.green("Backend package.json created"));

	spinner.start("Creating package.json for frontend...");
	await createPackageJson(clientPath, "client");
	spinner.succeed(chalk.green("Frontend package.json created"));

	spinner.start("Creating server files...");
	await createServerFiles(serverPath);
	spinner.succeed(chalk.green("Server Files Created"));

	spinner.start("Creating React frontend files...");
	await createReactFiles(srcPath);
	spinner.succeed(chalk.green("React frontend files created"));

	if (installDeps) {
		spinner.start("Installing backend dependencies...");
		execSync("npm install", { cwd: serverPath, stdio: "inherit" });
		spinner.succeed();

		spinner.start("Installing frontend dependencies...");
		execSync("npm install", { cwd: clientPath, stdio: "inherit" });
		spinner.succeed(chalk.green("Installed....."));
	} else {
		console.log(
			"You can install the dependencies later by running 'npm install' in both the 'server' and 'client' directories."
		);
	}

	chalk.green("MERN boilerplate setup complete!");
}

async function createPackageJson(dir: string, type: string) {
	const packageJsonContent = {
		name: type === "server" ? "mern-server" : "mern-client",
		version: "1.0.0",
		scripts:
			type === "server"
				? {
						start: "node server.js",
						dev: "nodemon server.js",
				  }
				: {
						start: "react-scripts start",
						build: "react-scripts build",
						test: "react-scripts test",
						eject: "react-scripts eject",
				  },
		dependencies:
			type === "server"
				? {}
				: {
						react: "^18.0.0",
						"react-dom": "^18.0.0",
						"react-router-dom": "^6.0.0",
						axios: "^0.21.1",
				  },
		devDependencies:
			type === "server"
				? {
						nodemon: "^2.0.7",
				  }
				: {},
	};

	await fs.writeJson(path.join(dir, "package.json"), packageJsonContent, {
		spaces: 2,
	});
}

async function createServerFiles(serverPath: string) {
	const serverFileContent = `
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected...");
}).catch(err => console.error("Could not connect to MongoDB...", err));

// Sample route
app.get('/', (req, res) => res.send("API running"));

// Start server
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  `;

	await fs.writeFile(path.join(serverPath, "server.js"), serverFileContent);

	const envContent = `MONGO_URI=your_mongodb_connection_string_here`;
	await fs.writeFile(path.join(serverPath, ".env"), envContent);
}

async function createReactFiles(srcPath: string) {
	const appFileContent = `
import React from 'react';
import './globals.css';

function App() {
  return (
    <div className="App">
      <h1>MERN Boilerplate</h1>
    </div>
  );
}

export default App;
  `;

	const globalsCssContent = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
  `;

	await fs.writeFile(path.join(srcPath, "App.js"), appFileContent);
	await fs.writeFile(path.join(srcPath, "globals.css"), globalsCssContent);

	const indexFileContent = `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './globals.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
  `;

	await fs.writeFile(path.join(srcPath, "index.js"), indexFileContent);
}

export { createMERNBoilerplate };

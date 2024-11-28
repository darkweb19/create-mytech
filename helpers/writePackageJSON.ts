import path from "path";
import fs from "fs-extra";

export const writePackageJSON = async (
	projectPath: string,
	dependencies: Object,
	devDependencies: Object
) => {
	const packageJsonPath = path.join(projectPath, "package.json");
	const packageJson = await fs.readJson(packageJsonPath);

	packageJson.dependencies = {
		...packageJson.dependencies,
		dependencies,
	};
	packageJson.devDependencies = {
		...packageJson.devDependencies,
		devDependencies,
	};

	await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
};

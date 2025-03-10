module.exports = {
	apps: [
		{
			name: "dairi_client",
			script: "bun",
			args: ["run", "preview"], // Pass "run preview" to run the script in package.json
			cwd: "/home/anji/data/project/dairi/client", // Path where package.json is located
			env: {
				NODE_ENV: "production",
				TESTENV: "Test"
			},
			interpreter: "none", // Specify "none" to prevent PM2 from looking for an actual file named "preview"
		}
	]
};

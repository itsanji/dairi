module.exports = {
	apps: [
		{
			name: "dairi_client", 
			script: "bun",
			args: ["run", "dev"], // Pass "run preview" to run the script in package.json
			cwd: "/home/anji/data/project/dairi/client", // Path where package.json is located
			interpreter: "none" // Specify "none" to prevent PM2 from looking for an actual file named "preview"
		}
	]
};

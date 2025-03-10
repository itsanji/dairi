import { exec } from "child_process";

export const runScript = (scriptPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(scriptPath, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
};

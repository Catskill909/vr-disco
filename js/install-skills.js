const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname, '../.gemini/threejs-skills-repo/skills');
const DEST_DIR = path.resolve(__dirname, '../.agent/skills');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log(`Searching for skills in: ${SOURCE_DIR}`);

try {
    const entries = fs.readdirSync(SOURCE_DIR, { withFileTypes: true });

    entries.forEach(entry => {
        if (entry.isDirectory()) {
            const skillName = entry.name;
            const skillPath = path.join(SOURCE_DIR, skillName, 'SKILL.md');

            if (fs.existsSync(skillPath)) {
                // Read the source skill file
                const content = fs.readFileSync(skillPath, 'utf8');

                // Destination file path (e.g., .agent/skills/threejs-fundamentals.md)
                const destPath = path.join(DEST_DIR, `${skillName}.md`);

                // Write to destination
                fs.writeFileSync(destPath, content);
                console.log(`Installed skill: ${skillName} -> ${destPath}`);
            } else {
                console.warn(`Skipping ${skillName}: SKILL.md not found.`);
            }
        }
    });

    console.log("All skills installed successfully.");

} catch (err) {
    console.error("Error installing skills:", err);
}

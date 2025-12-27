const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Replace imports with versions
            // Matches: from "package@1.2.3" or from "@scope/package@1.2.3"
            // Handled cases:
            // from 'sonner@2.0.3'
            // from "@radix-ui/react-slot@1.1.2"

            // Regex explanations:
            // from\s+ -> matches "from "
            // (['"]) -> Group 1: matches quote
            // ([^'"]+) -> Group 2: matches package name
            // @\d+\.\d+\.\d+ -> matches version (e.g. @1.0.0)
            // (['"]) -> Group 3: matches closing quote

            const regex = /from\s+(['"])([^'"]+)@\d+\.\d+\.\d+(['"])/g;

            if (regex.test(content)) {
                const newContent = content.replace(regex, 'from $1$2$3');
                fs.writeFileSync(filePath, newContent);
                console.log(`Fixed ${filePath}`);
            }
        }
    });
}

if (!fs.existsSync(rootDir)) {
    console.error('Directory not found:', rootDir);
    process.exit(1);
}

console.log('Scanning src directory for incorrect imports...');
walkDir(rootDir);
console.log('Done.');

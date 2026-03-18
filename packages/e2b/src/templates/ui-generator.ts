import { Template } from "e2b";
import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export const UI_GENERATOR_TEMPLATE = "ui-generator-template";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const claudeMd = readFileSync(join(__dirname, "CLAUDE.md"), "utf-8");

// Read all skills from the skills/ directory
const skillsDir = join(__dirname, "skills");
const skillEntries = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({
    name: d.name,
    content: readFileSync(join(skillsDir, d.name, "SKILL.md"), "utf-8"),
  }));

// Build the template
let builder: any = Template()
  .fromTemplate("mcp-gateway")
  // Write CLAUDE.md
  .runCmd(`cat > /home/user/CLAUDE.md << 'ENDOFCLAUDEMD'\n${claudeMd}\nENDOFCLAUDEMD`);

// Write each skill
for (const skill of skillEntries) {
  const skillDir = `/home/user/.claude/skills/${skill.name}`;
  builder = builder
    .runCmd(`mkdir -p ${skillDir}`)
    .runCmd(`cat > ${skillDir}/SKILL.md << 'ENDOFSKILL'\n${skill.content}\nENDOFSKILL`);
}

// Install Playwright with Chromium for PDF export
builder = builder
  .runCmd("npm install playwright")
  .runCmd("npx playwright install --with-deps chromium");

// Install GitHub CLI
builder = builder
  .runCmd([
    'bash -lc "type -p wget >/dev/null || (sudo apt update && sudo apt install -y wget)"',
    'bash -lc "sudo mkdir -p -m 755 /etc/apt/keyrings"',
    'bash -lc "out=$(mktemp) && wget -nv -O \\$out https://cli.github.com/packages/githubcli-archive-keyring.gpg && sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg < \\$out >/dev/null && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg"',
    'bash -lc "sudo mkdir -p -m 755 /etc/apt/sources.list.d && echo \\"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\\" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null"',
    'bash -lc "sudo apt update && sudo apt install -y gh"',
  ])
  // Login to GitHub
  .runCmd([
    `bash -lc "gh auth login --with-token <<< '${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}'"`,
  ]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uiGeneratorTemplate = builder.skipCache();

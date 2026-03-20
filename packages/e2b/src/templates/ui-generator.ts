import { Template } from "e2b";
import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export const UI_GENERATOR_TEMPLATE = "ui-generator-template";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Build the template
let builder = Template()
  .fromTemplate("mcp-gateway")

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
  ])
  // Clone app-builder repo into /home/user/.claude
  .gitClone(`https://${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/aibuilder-ai/app-builder.git`, "/home/user/.claude")
  // Remove .git to avoid exposing credentials baked into the clone URL
  .runCmd("rm -rf /home/user/.claude/.git")
  // Move CLAUDE.md from cloned repo to /home/user
  .runCmd("mv /home/user/.claude/CLAUDE.md /home/user/CLAUDE.md");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uiGeneratorTemplate = builder.skipCache();

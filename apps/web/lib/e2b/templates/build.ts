import { defaultBuildLogger, Template } from "@e2b/code-interpreter";
import {
  UI_GENERATOR_TEMPLATE,
  uiGeneratorTemplate,
} from "./ui-generator";

async function main() {
  await Template.build(
    uiGeneratorTemplate,
    UI_GENERATOR_TEMPLATE,
    {
      cpuCount: 8,
      memoryMB: 8192,
      onBuildLogs: defaultBuildLogger(),
      skipCache: true,
    },
  );
}

main().catch(console.error);

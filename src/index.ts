import { getOctokit, context } from "@actions/github";
import { Octokit } from "@octokit/action";
import * as core from "@actions/core";

const cancelAction = async () => {
  if (core.getInput("GITHUB_TOKEN")) {
    const octokit = new Octokit();

    await octokit.actions.cancelWorkflowRun({
      ...context.repo,
      run_id: context.runId,
    });

    // Wait a maximum of 1 minute for the action to be cancelled.
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }

  // If no GitHub token or timeout has passed, fail action.
  process.exit(1);
};

async function main() {
  const kit = getOctokit(core.getInput("PAT"));

  const comments = await kit.rest.issues.listComments({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  const vercel_comment = comments.data.find((comment) => {
    return (
      comment.user?.login === "vercel[bot]" && comment.user?.type === "Bot"
    );
  });

  const vercel_body = vercel_comment?.body;

  if (vercel_body == null) {
    console.log("Vercel comment body not found");
    await cancelAction();
  }

  const preview_url_regexp = new RegExp(core.getInput("preview_url_regexp"));
  const regex_matches = vercel_body?.match(preview_url_regexp);

  if (regex_matches != null) {
    const link = regex_matches[1];
    core.setOutput("vercel_preview_url", link);
    console.log(`Found Link: ${link}`);

    process.exit(0);
  } else {
    console.log("No link found");
    await cancelAction();
  }
}

(async () => {
  main();
})();

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
const action_1 = require("@octokit/action");
const core_1 = __importDefault(require("@actions/core"));
const cancelAction = () => __awaiter(void 0, void 0, void 0, function* () {
    if (core_1.default.getInput("GITHUB_TOKEN")) {
        const octokit = new action_1.Octokit();
        yield octokit.actions.cancelWorkflowRun(Object.assign(Object.assign({}, github_1.context.repo), { run_id: github_1.context.runId }));
        // Wait a maximum of 1 minute for the action to be cancelled.
        yield new Promise((resolve) => setTimeout(resolve, 60000));
    }
    // If no GitHub token or timeout has passed, fail action.
    process.exit(1);
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const kit = github_1.getOctokit(core_1.default.getInput("PAT"));
        const comments = yield kit.rest.issues.listComments({
            issue_number: github_1.context.issue.number,
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
        });
        const vercel_comment = comments.data.find((comment) => {
            var _a, _b;
            return (((_a = comment.user) === null || _a === void 0 ? void 0 : _a.login) === "vercel[bot]" && ((_b = comment.user) === null || _b === void 0 ? void 0 : _b.type) === "Bot");
        });
        const vercel_body = vercel_comment === null || vercel_comment === void 0 ? void 0 : vercel_comment.body;
        if (vercel_body == null) {
            console.log("Vercel comment body not found");
            yield cancelAction();
        }
        const preview_url_regexp = new RegExp(core_1.default.getInput("preview_url_regexp"));
        const regex_matches = vercel_body === null || vercel_body === void 0 ? void 0 : vercel_body.match(preview_url_regexp);
        if (regex_matches != null) {
            const link = regex_matches[1];
            core_1.default.setOutput("vercer_preview_url", link);
            process.exit(0);
        }
        else {
            console.log("No link found");
            yield cancelAction();
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    main();
}))();

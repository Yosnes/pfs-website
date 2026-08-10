import { handleCareerAnalyze } from '../../career-navigator-api.js';

export async function onRequestPost({ request, env }) {
  return handleCareerAnalyze(request, env);
}

import { handleCareerPathways } from '../../career-navigator-api.js';

export async function onRequestPost({ request, env }) {
  return handleCareerPathways(request, env);
}

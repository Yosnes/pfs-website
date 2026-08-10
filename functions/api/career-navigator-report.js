import { handleCareerReport } from '../../career-navigator-api.js';

export async function onRequestPost(context) {
  return handleCareerReport(
    context.request,
    context.env,
    context.waitUntil.bind(context),
  );
}

import { handleCareerFeedback } from '../../career-navigator-api.js';

export async function onRequestPost(context) {
  return handleCareerFeedback(
    context.request,
    context.env,
    context.waitUntil.bind(context),
  );
}

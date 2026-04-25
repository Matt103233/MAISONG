import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          is_check: { type: 'boolean' },
          central_argument: { type: 'string' },
          central_tension: { type: 'string' },
          load_bearing_images: { type: 'array', items: { type: 'string' } },
          posture: { type: 'string' },
          landing: { type: 'string' },
          drift_to_avoid: { type: 'string' },
          is_question: { type: 'boolean' },
          question_text: { type: 'string' },
          title: { type: 'string' },
          hook_line: { type: 'string' },
          lyrics: { type: 'string' },
          style_tag: { type: 'string' },
          backstory: { type: 'string' },
          scripture_refs: { type: 'array', items: { type: 'string' } },
          production_notes: { type: 'string' },
          captions: {
            type: 'object',
            properties: {
              instagram: { type: 'string' },
              tiktok: { type: 'string' },
              facebook: { type: 'string' },
              youtube: { type: 'string' },
              twitter: { type: 'string' },
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
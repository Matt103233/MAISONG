import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all journal entries
    const entries = await base44.asServiceRole.entities.JournalEntry.list('-created_date', 100);

    if (!entries || entries.length === 0) {
      return Response.json({ message: 'No journal entries found.' });
    }

    // For each entry that has content, extract seeds via LLM
    const allSections = [];

    for (const entry of entries) {
      if (!entry.content) continue;

      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Christian songwriter's assistant. Read this journal entry and extract 3-5 distinct song seed ideas.

For each idea extract:
- theme: the core emotional/spiritual theme (1-2 sentences)
- hook_idea: a potential hook line or title concept
- scripture_hint: one relevant scripture reference (book, chapter:verse if possible)
- scripture_quote: a short relevant scripture quote (actual text, KJV or NIV)
- mood: the emotional tone
- writing_prompt: a one-sentence creative writing prompt to spark a song

Journal entry titled "${entry.title}":
"${entry.content.slice(0, 3000)}"`,
        response_json_schema: {
          type: 'object',
          properties: {
            seeds: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  theme: { type: 'string' },
                  hook_idea: { type: 'string' },
                  scripture_hint: { type: 'string' },
                  scripture_quote: { type: 'string' },
                  mood: { type: 'string' },
                  writing_prompt: { type: 'string' },
                }
              }
            }
          }
        }
      });

      const seeds = res.seeds || [];
      if (seeds.length === 0) continue;

      let section = `================================================================\nJOURNAL: ${entry.title.toUpperCase()}\n================================================================\n\n`;

      seeds.forEach((seed, i) => {
        section += `--- SEED ${i + 1} ---\n\n`;
        section += `THEME:\n${seed.theme}\n\n`;
        section += `HOOK / TITLE IDEA:\n"${seed.hook_idea || '—'}"\n\n`;
        section += `MOOD: ${seed.mood || '—'}\n\n`;
        section += `SCRIPTURE: ${seed.scripture_hint || '—'}\n`;
        if (seed.scripture_quote) {
          section += `"${seed.scripture_quote}"\n`;
        }
        section += `\nWRITING PROMPT:\n${seed.writing_prompt || '—'}\n\n`;
      });

      allSections.push(section);
    }

    if (allSections.length === 0) {
      return Response.json({ message: 'No seeds extracted — journal entries may have no content.' });
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });

    const emailBody = `DAILY SONG SEEDS — ${today}
mAIsong.ai | Harrison Productions
================================================================

${allSections.join('\n')}
================================================================
END OF DAILY SONG SEEDS
================================================================

Copy any seed directly into the Builder to start writing.
`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'gsueaglefan@gmail.com',
      subject: `Daily Song Seeds — ${today}`,
      body: emailBody,
    });

    return Response.json({ success: true, entries_processed: allSections.length, message: `Daily Song Seeds email sent with ${allSections.length} journal sections.` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
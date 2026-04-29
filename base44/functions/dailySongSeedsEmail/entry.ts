import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const entries = await base44.asServiceRole.entities.JournalEntry.list('-created_date', 100);

    if (!entries || entries.length === 0) {
      return Response.json({ message: 'No journal entries found.' });
    }

    const allSections = [];

    for (const entry of entries) {
      if (!entry.content) continue;

      // Use plain text response to avoid JSON parsing issues
      const rawText = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are a Christian songwriter's assistant. Read this journal entry and extract 3-5 distinct song seed ideas. Format your response EXACTLY like this plain text template, repeating the block for each seed:

--- SEED 1 ---
THEME: [core emotional/spiritual theme, 1-2 sentences]
HOOK: "[potential hook line or song title idea]"
MOOD: [emotional tone, e.g. hopeful, raw, triumphant, tender]
SCRIPTURE: [reference, e.g. Romans 8:28]
VERSE: "[actual text of that verse]"
PROMPT: [one sentence creative writing prompt to spark writing this song]

--- SEED 2 ---
[etc...]

Journal entry titled "${entry.title}":
"${entry.content.slice(0, 2500)}"

Return ONLY the seed blocks. No intro, no summary.`,
      });

      if (!rawText || rawText.trim().length === 0) continue;

      const section = `\n================================================================\nJOURNAL: ${entry.title.toUpperCase()}\n================================================================\n\n${rawText.trim()}\n`;
      allSections.push(section);
    }

    if (allSections.length === 0) {
      return Response.json({ message: 'No seeds extracted.' });
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'America/Chicago'
    });

    const emailBody = `DAILY SONG SEEDS — ${today}
mAIsong.ai | Harrison Productions
Journals Processed: ${allSections.length}
${allSections.join('\n')}
================================================================
END — Copy any seed into the Builder to start writing!
================================================================`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'gsueaglefan@gmail.com',
      subject: `Daily Song Seeds — ${today}`,
      body: emailBody,
    });

    return Response.json({
      success: true,
      entries_processed: allSections.length,
      message: `Email sent with ${allSections.length} journal sections.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
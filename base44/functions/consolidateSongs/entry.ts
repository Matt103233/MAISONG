import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const harrisonAppId = '69e3a813fd68a250ce813dcf';
    const brainAppId = '69e7f48bc659514472fd2d0b';

    // Fetch all songs from current app
    const currentSongs = await base44.asServiceRole.entities.Song.list();

    // Create a map of titles we already have to avoid duplication
    const existingTitles = new Set(currentSongs.map(s => (s.title || '').toLowerCase()));

    // Convert current songs to SongLibrary format
    const libraryRecords = currentSongs.map(s => ({
      title: s.title,
      lyrics: s.lyrics_block,
      style_tag: s.style_tag,
      style_prompts: s.tags || [],
      captions: s.captions || {},
      hook_line: s.hook_line,
      backstory: s.backstory,
      production_notes: s.production_notes,
      scripture: s.scripture || [],
      source_app: 'mAIsong.ai',
      source_app_id: 'local',
      original_id: s.id,
      status: s.status || 'draft',
    }));

    // Clear existing SongLibrary to rebuild from scratch
    const existingLibrary = await base44.asServiceRole.entities.SongLibrary.list();
    for (const record of existingLibrary) {
      await base44.asServiceRole.entities.SongLibrary.delete(record.id);
    }

    // Insert all consolidated records
    if (libraryRecords.length > 0) {
      await base44.asServiceRole.entities.SongLibrary.bulkCreate(libraryRecords);
    }

    return Response.json({
      success: true,
      consolidated_count: libraryRecords.length,
      message: `Consolidated ${libraryRecords.length} songs from mAIsong.ai`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
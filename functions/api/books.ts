interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  try {
    const { results } = await DB.prepare("SELECT * FROM books ORDER BY created_at DESC").all();
    return Response.json(results, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'CDN-Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return Response.json({ error: 'Failed to fetch books', detail: error?.message }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  try {
    const data: any = await context.request.json();

    if (!data.title || !data.description || !data.author || !data.poster) {
      return Response.json({ error: 'Missing fields', fields: { title: !!data.title, description: !!data.description, author: !!data.author, poster: !!data.poster } }, { status: 400 });
    }

    await DB.prepare("INSERT INTO books (title, description, author, link, poster, co_authors) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(data.title, data.description, data.author, data.link || null, data.poster, data.co_authors || '')
      .run();

    return Response.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: 'Failed to create book', detail: error?.message }, { status: 500 });
  }
};

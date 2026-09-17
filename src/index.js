export default {
  async fetch(request, env, ctx) {
    const PASSWORD = "XZ0413";
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    try {
      const body = await request.json();
      const ok = body.pwd === PASSWORD;
      return Response.json({ success: ok }, {
        headers: {"Access-Control-Allow-Origin": "*"}
      });
    } catch {
      return Response.json({ success: false });
    }
  }
};

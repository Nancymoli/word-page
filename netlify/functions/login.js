export async function onRequestPost(context) {
  const PASSWORD = "XZ0413";
  try {
    const body = await context.request.json();
    const ok = body.pwd === PASSWORD;
    return new Response(JSON.stringify({ success: ok }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, msg: "请求异常" }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

exports.handler = async function(event) {
  const PASSWORD = "XZ0413";
  const body = JSON.parse(event.body);
  const ok = body.pwd === PASSWORD;
  return {
    statusCode: 200,
    body: JSON.stringify({ success: ok })
  };
}

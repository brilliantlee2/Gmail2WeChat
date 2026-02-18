const WECOM_WEBHOOK_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";  // 填你的
const LABEL = "INBOX";     // 可改成特定标签
const MAX_CHECK = 5;       // 每次最多检查多少封

function notifyWeComForNewEmails() {
  const props = PropertiesService.getScriptProperties();
  const lastTime = Number(props.getProperty("LAST_TIME") || 0);

  // 取最近邮件（最多 MAX_CHECK 封）
  const threads = GmailApp.search(`in:${LABEL} newer_than:1d`, 0, MAX_CHECK);

  let newestTime = lastTime;
  let pushed = 0;

  for (const thread of threads) {
    const msgs = thread.getMessages();
    const msg = msgs[msgs.length - 1]; // 取线程最新一封

    const t = msg.getDate().getTime();
    if (t <= lastTime) continue;

    const from = msg.getFrom();
    const subject = msg.getSubject() || "(无主题)";
    const snippet = msg.getPlainBody().slice(0, 300).replace(/\n+/g, "\n");

    const textContent =
      `📧 Gmail新邮件\n` +
      `--------------------\n` +
      `发件人: ${from}\n` +
      `主题: ${subject}\n` +
      `时间: ${msg.getDate()}\n` +
      `--------------------\n` +
      `${snippet}`;

    postToWeCom(textContent);

    if (t > newestTime) newestTime = t;
    pushed++;
  }

  if (newestTime > lastTime) props.setProperty("LAST_TIME", String(newestTime));

  Logger.log(`Pushed: ${pushed}`);
}

function postToWeCom(text) {
  const payload = {
    msgtype: "text",
    text: { content: text }
  };

  UrlFetchApp.fetch(WECOM_WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
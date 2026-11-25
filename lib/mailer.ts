import tls from "node:tls";

// Minimal SMTP sender (implicit TLS, port 465) so the site can send alerts
// through the business Google account without extra packages.
// Env: SMTP_USER (Google login), SMTP_PASS (Google app password),
//      SMTP_FROM (e.g. accounts@blacklinemotorsco.com).

type Mail = { to: string; subject: string; text: string; replyTo?: string };

export function mailerEnabled() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function encodeHeader(value: string) {
  return /^[\x20-\x7e]*$/.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

export async function sendMail(mail: Mail): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return false;
  const from = process.env.SMTP_FROM || user;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";

  return new Promise<boolean>((resolve) => {
    const socket = tls.connect({ host, port: 465, servername: host });
    let buffer = "";
    let step = 0;
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      socket.end();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), 15000);

    const body = mail.text.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
    const message = [
      `From: ${encodeHeader("Blackline Motors Website")} <${from}>`,
      `To: <${mail.to}>`,
      ...(mail.replyTo ? [`Reply-To: <${mail.replyTo}>`] : []),
      `Subject: ${encodeHeader(mail.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      body,
      ".",
    ].join("\r\n");

    const commands = [
      `EHLO blacklinemotorsco.com`,
      `AUTH PLAIN ${Buffer.from(`\u0000${user}\u0000${pass}`).toString("base64")}`,
      `MAIL FROM:<${from}>`,
      `RCPT TO:<${mail.to}>`,
      `DATA`,
      message,
      `QUIT`,
    ];
    // Expected reply code before sending each command (index = step).
    const expect = ["220", "250", "235", "250", "250", "354", "250"];

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        // Multi-line replies use "250-"; wait for the final "250 " line.
        if (line.length < 4 || line[3] === "-") continue;
        const code = line.slice(0, 3);
        if (code !== expect[step]) return finish(false);
        if (step === commands.length) return finish(true);
        socket.write(commands[step] + "\r\n");
        step += 1;
        if (step === commands.length) return finish(true);
      }
    });
    socket.on("error", () => finish(false));
  });
}

const fs = require('fs');
const file = 'apps/web/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<button\s*onClick=\{handleLogout\}/;
const injection = `{currentUser.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          style={{
                            display: "block",
                            textDecoration: "none",
                            padding: "6px 8px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                            backgroundColor: "var(--oj-color-accent)",
                            borderRadius: "6px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            textAlign: "center"
                          }}
                        >
                          Panel d'Administration ??
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}`;

content = content.replace(regex, injection);
fs.writeFileSync(file, content);
console.log('Injected admin link with regex!');

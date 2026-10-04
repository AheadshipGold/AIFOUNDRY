const fs = require('fs');
const file = 'apps/web/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `
                      <div style={{ paddingBottom: "8px", borderBottom: "1px solid var(--oj-color-border)" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--oj-color-text)" }}>{currentUser.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--oj-color-accent)", fontWeight: 600, marginTop: "2px" }}>
                          {currentUser.role === "ADMIN"
                            ? "?? Super Administrateur"
                            : currentUser.role === "SELLER"
                            ? \`?? Vendeur Certifié · \${currentUser.shopName || "Boutique"}\`
                            : "??? Client Privilège"}
                        </div>
                      </div>
`;

const replacement = `
                      <div style={{ paddingBottom: "8px", borderBottom: "1px solid var(--oj-color-border)", marginBottom: "8px" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--oj-color-text)" }}>{currentUser.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--oj-color-accent)", fontWeight: 600, marginTop: "2px" }}>
                          {currentUser.role === "ADMIN"
                            ? "?? Super Administrateur"
                            : currentUser.role === "SELLER"
                            ? \`?? Vendeur Certifié · \${currentUser.shopName || "Boutique"}\`
                            : "??? Client Privilège"}
                        </div>
                      </div>

                      {currentUser.role === "ADMIN" && (
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
`;

content = content.replace(target.trim(), replacement.trim());
fs.writeFileSync(file, content);
console.log('done');

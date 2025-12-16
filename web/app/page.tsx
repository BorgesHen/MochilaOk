export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  let text = "";
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    text = await res.text();
  } catch (err: any) {
    text = `Erro ao chamar API: ${err?.message ?? err}`;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>MochilaOK</h1>
      <p>Chamando API em:</p>
      <pre>{apiUrl}</pre>

      <p>Resposta da API (Nest):</p>
      <pre>{text}</pre>
    </main>
  );
}

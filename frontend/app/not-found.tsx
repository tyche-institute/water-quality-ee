import { shellCopy } from "./lib/shell-copy";

export default function NotFound() {
  return (
    <main className="page">
      <section className="panel">
        <h1 className="title">{shellCopy.notFoundTitle}</h1>
        <p className="hint">{shellCopy.notFoundHint}</p>
      </section>
    </main>
  );
}

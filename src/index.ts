import { Wordgard, menuBar } from "wordgard/editor";
import { fullSchema } from "wordgard/schema";
import { history } from "wordgard/history";
import html from "./genesis.html?raw";
import json from "./genesis.json?raw";

const parent = document.getElementById("editor")!;
const config = [fullSchema(), history(), menuBar()];
const trialInput = document.getElementById("trials")! as HTMLInputElement;
const compressionSelect = document.getElementById(
  "compression",
)! as HTMLSelectElement;
const results = document.getElementById("results")! as HTMLDivElement;

async function compressString(str: string, encoding: CompressionFormat | "none") {
	if (encoding == "none") return str;
  const byteArray = new TextEncoder().encode(str);

  const cs = new CompressionStream(encoding);
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();

  return new Response(cs.readable).arrayBuffer();
}

async function decompressString(
  buffer: BufferSource,
  encoding: CompressionFormat | "none",
) {
	if (encoding == "none") return buffer;
  const ds = new DecompressionStream(encoding);
  const writer = ds.writable.getWriter();
  writer.write(buffer);
  writer.close();

  const arrayBuffer = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(arrayBuffer);
}

async function initWg(doc: string, label: string) {
	const compression = compressionSelect.value as CompressionFormat;
	const compressed = await compressString(doc, compression);

  const start = new Date();
	let decompressed = await decompressString(compressed, compression);
  if (label == "json") decompressed = JSON.parse(doc as string);
  Wordgard.create({ parent, doc: decompressed, config });
  return new Date().getTime() - start.getTime();
}

async function runTrials(doc: string, label: string) {
  const times = [];
  for (let i = 0; i < trialInput.valueAsNumber; i++) {
    times.push(await initWg(doc, label));
    parent.innerHTML = "";
    await new Promise((res) => setTimeout(res, 100));
  }
  return times;
}

async function benchDocFmt(doc: string, label: string) {
  const htmlTimes = await runTrials(doc, label);
  const resultLine = document.createElement("div");
  resultLine.innerText = label + " ";
  resultLine.innerText += htmlTimes.join(", ");
  resultLine.innerText +=
    " avg " + htmlTimes.reduce((acc, cur) => acc + cur, 0) / htmlTimes.length;
  results.append(resultLine);
}

(window as any).html = () => benchDocFmt(html, "html");
(window as any).json = () => benchDocFmt(json, "json");

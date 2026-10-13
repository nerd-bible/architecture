import { menuBar } from "wordgard/editor";
import { fullSchema } from "wordgard/schema";
import { history } from "wordgard/history";
import html from "./genesis.html?raw";
import json from "./genesis.json?raw";
import type { Node } from "wordgard/doc";
import { openDB } from "idb";
import { GardState } from "wordgard/state";

type DocSource = string | Node.JSON;
type Compression = CompressionFormat | "none";
type Persistence = "none" | "idb" | "opfs" | "opfs-sync";
type Encoding = "utf-8" | "utf-16";

const results = document.getElementById("results")! as HTMLDivElement;
const form = document.getElementById("form")! as HTMLFormElement;
const worker = new Worker(new URL("./worker.ts", import.meta.url), {
	type: "module",
});

const config = [fullSchema(), history(), menuBar()];
const idb = await openDB("tmp", 2, {
	upgrade: (db) => db.createObjectStore("tmp"),
});

function encodeUtf16(str: string) {
	const buf = new ArrayBuffer(str.length * 2);
	const bufView = new Uint16Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return new Uint8Array(bufView.buffer);
}

async function compressString(
	str: string,
	encoding: Encoding,
	compression: Compression,
) {
	const byteArray =
		encoding == "utf-8" ? new TextEncoder().encode(str) : encodeUtf16(str);

	if (compression != "none") {
		const cs = new CompressionStream(compression);
		const writer = cs.writable.getWriter();
		writer.write(byteArray);
		writer.close();
		return new Response(cs.readable).bytes();
	}

	return byteArray;
}

async function decompressString(
	buffer: BufferSource,
	compression: Compression,
	encoding: Encoding,
): Promise<string> {
	if (compression != "none") {
		const ds = new DecompressionStream(compression as CompressionFormat);
		const writer = ds.writable.getWriter();
		writer.write(buffer);
		writer.close();
		buffer = await new Response(ds.readable).arrayBuffer();
	}

	return new TextDecoder(encoding, { fatal: true }).decode(buffer);
}

let memoryStore = new Uint8Array();
async function store(
	encoded: Uint8Array<ArrayBuffer>,
	persistence: Persistence,
) {
	if (persistence == "none") memoryStore = encoded;
	else if (persistence == "opfs") {
		const root = await navigator.storage.getDirectory();
		const fileHandle = await root.getFileHandle("tmp", { create: true });
		const writable = await fileHandle.createWritable();
		await writable.truncate(0);
		await writable.write(encoded);
		await writable.close();
	} else if (persistence == "idb") {
		await idb.put("tmp", encoded, "tmp");
	} else if (persistence == "opfs-sync") {
		return new Promise((res) => {
			worker.onmessage = res;
			worker.postMessage({ store: encoded });
		});
	}
}

async function load(persistence: Persistence) {
	if (persistence == "none") return memoryStore;
	else if (persistence == "opfs") {
		const root = await navigator.storage.getDirectory();
		const fileHandle = await root.getFileHandle("tmp");
		const file = await fileHandle.getFile();
		return file.bytes();
	} else if (persistence == "idb") {
		return idb.get("tmp", "tmp");
	} else if (persistence == "opfs-sync") {
		return new Promise((res) => {
			worker.onmessage = (ev) => res(ev.data);
			worker.postMessage({});
		});
	}
}

async function initWg(
	encoded: ArrayBuffer,
	format: string,
	compression: Compression,
	encoding: Encoding,
) {
	let doc: DocSource = await decompressString(encoded, compression, encoding);
	if (format == "json") doc = JSON.parse(doc);
	const state = GardState.create({ doc, config });
	// prevent optimization
	let sum = 0;
	state.doc.iterate((l) => {
		sum += l.length;
	});
	console.log(sum);
}

async function trial(
	persistence: Persistence,
	format: string,
	compression: Compression,
	encoding: Encoding,
) {
	const raw = await load(persistence);
	await initWg(raw, format, compression, encoding);
}

async function runTrials(
	doc: string,
	format: string,
	compression: Compression,
	persistence: Persistence,
	nTrials: number,
	encoding: Encoding,
) {
	const compressed = await compressString(doc, encoding, compression);
	await store(compressed, persistence);

	const times = [];
	for (let i = 0; i < nTrials; i++) {
		const start = performance.now();
		await trial(persistence, format, compression, encoding);
		times.push(performance.now() - start);
	}
	return times;
}

form.addEventListener("submit", async (ev) => {
	ev.preventDefault();

	const formData = new FormData(form);
	const data = Object.fromEntries(formData.entries()) as {
		trials: string;
		format: "html" | "json";
		compression: Compression;
		persistence: Persistence;
		encoding: Encoding;
	};

	const nTrials = Number.parseInt(data.trials);
	const doc = data.format == "html" ? html : json;

	const trials = await runTrials(
		doc,
		data.format,
		data.compression,
		data.persistence,
		nTrials,
		data.encoding,
	);
	const resultLine = document.createElement("div");
	resultLine.innerText = [
		`${nTrials}x`,
		data.encoding,
		data.compression,
		data.format,
		data.persistence,
	].join(" ");
	resultLine.innerText +=
		" avg " +
		(trials.reduce((acc, cur) => acc + cur, 0) / trials.length).toPrecision(3);
	// resultLine.innerText += ` [${trials.map((t) => t.toPrecision(3)).join(", ")}]`;
	results.append(resultLine);
});

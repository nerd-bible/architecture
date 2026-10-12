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

const results = document.getElementById("results")! as HTMLDivElement;
const form = document.getElementById("form")! as HTMLFormElement;
const worker = new Worker(new URL("./worker.ts", import.meta.url), {
	type: "module",
});

const config = [fullSchema(), history(), menuBar()];
const idb = await openDB("tmp", 2, {
	upgrade: (db) => db.createObjectStore("tmp"),
});

async function compressString(str: string, encoding: Compression) {
	const byteArray = new TextEncoder().encode(str);

	if (encoding != "none") {
		const cs = new CompressionStream(encoding);
		const writer = cs.writable.getWriter();
		writer.write(byteArray);
		writer.close();
		return new Response(cs.readable).bytes();
	}

	return byteArray;
}

async function decompressString(
	buffer: BufferSource,
	encoding: Compression,
): Promise<string> {
	if (encoding != "none") {
		const ds = new DecompressionStream(encoding as CompressionFormat);
		const writer = ds.writable.getWriter();
		writer.write(buffer);
		writer.close();
		buffer = await new Response(ds.readable).arrayBuffer();
	}

	return new TextDecoder().decode(buffer);
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
	encoding: string,
	compression: Compression,
) {
	let doc: DocSource = await decompressString(encoded, compression);
	if (encoding == "json") doc = JSON.parse(doc);
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
	encoding: string,
	compression: Compression,
) {
	const raw = await load(persistence);
	await initWg(raw, encoding, compression);
}

async function runTrials(
	doc: string,
	encoding: string,
	compression: Compression,
	persistence: Persistence,
	nTrials: number,
) {
	const compressed = await compressString(doc, compression);
	await store(compressed, persistence);

	const times = [];
	for (let i = 0; i < nTrials; i++) {
		const start = performance.now();
		await trial(persistence, encoding, compression);
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
	};

	const nTrials = Number.parseInt(data.trials);
	const doc = data.format == "html" ? html : json;

	const trials = await runTrials(
		doc,
		data.format,
		data.compression,
		data.persistence,
		nTrials,
	);
	const resultLine = document.createElement("div");
	resultLine.innerText = [
		`${nTrials}x`,
		data.compression,
		data.format,
		data.persistence,
	].join(" ");
	resultLine.innerText +=
		" avg " + (trials.reduce((acc, cur) => acc + cur, 0) / trials.length).toPrecision(3);
	resultLine.innerText += ` [${trials.map(t => t.toPrecision(3)).join(", ")}]`;
	results.append(resultLine);
});

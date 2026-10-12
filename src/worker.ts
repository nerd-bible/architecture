async function store(encoded: ArrayBuffer) {
	const root = await navigator.storage.getDirectory();
	const fileHandle = await root.getFileHandle("tmp", { create: true });
	const writable = await fileHandle.createSyncAccessHandle();
	await writable.truncate(0);
	await writable.write(encoded);
	await writable.flush();
	await writable.close();
}

async function load() {
	const root = await navigator.storage.getDirectory();
	const fileHandle = await root.getFileHandle("tmp");
	const file = await fileHandle.createSyncAccessHandle({ mode: "read-only" });
	const fileSize = file.getSize();
	const buffer = new DataView(new ArrayBuffer(fileSize));
	file.read(buffer, { at: 0 });
	file.close();

	return buffer;
}

self.onmessage = async function (event) {
	const data = event.data;

	if ("store" in data) {
		await store(data.store);
		self.postMessage("done");
	} else {
		const bytes = await load();
		self.postMessage(bytes, [bytes.buffer]);
	}
};

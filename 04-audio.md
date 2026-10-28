# audio

Narration should be possible.

- pocket tts is current best edge model for narration
	- web demo: https://pocket.ttstool.com/
	- https://huggingface.co/ken107/pocket-tts-onnx/tree/main
  - ~40MB compressed, https://github.com/ken107/piper-browser-extension/tree/pockettts/export
	- TODO: make custom training pipeline
		- add emotion tags
		- align words/syllables/phonemes
		- add emotion tags and speaker tags to text
			- pre-build N voices
		- support low-resource languages

# format

The format's job is to:
1. deserialize documents and their decorations (source maps, comments)
2. be indexable and partially loadable

RFC 8785's canonical JSON lacks #2, but is used anyway.

A custom binary format should be developed to:
- be trivially canonical
- take less space
- enable faster searching via a language model
- support partial loads

## JSON vs HTML

HTML diffs look better in Git, but it is non-canonical and Wordgard loads it
2x slower than JSON. For this reason JSON was selected.

## Custom

Ideally we'd use a compressed custom binary format sympathetic to search.

I descended into madness for a month. Here's what I learned:

NLP has many parts, is hard, and the ecosystem is fragmented by task. Here are
the tasks I'm interested in:

- Tokenizing, for smaller storage and faster search
	- Modern [BPE](5) is great at compressing, but bad at morphology. Methods like
	  [TreeTokenizer](6) can better learn morphology for more accurate
	  lemmatization, but are expensive. Finally, some cool meta tokens like
	  language/script markers and capitalization markers can be used for better
	  compression.
	- Generally each system (storage, lexical search, semantic search) has its own
	  tokenizer. In the interest of accuracy and code size, I'd like to use one.
- Part of Speech tagging, for search
	- Also want to identify common phrases and idioms
- Lemmatizing, for search
	- Also to link to a lexicon like [Wiktionary](1) or a [Webster's 1913 fork](2)
		- Also for spellcheck and maybe a [grammar correction](7) model!
	- Pronunciation, for search
- Named Entity Resolution, for building a knowledge base
- Coreference resolution, for search
	- I.e. Peter went fishing. Then he (Peter) saw Jesus. Then he (Jesus) said,
	  "Follow me."

The closest thing to what I want is [compromise](3) or [spaCy ported to JS](4).
Compromise tends to be innaccurate and difficult to extend for NER and
coreference resolution. It also has a lot of hard-coded rules. spaCy has the 
right idea with supporting ML models, but it's difficult to port to work in a
browser.

The right thing to do is to start from scratch and build a C API that can
support ML models.

[1]: https://kaikki.org/dictionary/rawdata.html
[2]: https://www.gutenberg.org/cache/epub/29765/pg29765.txt
[3]: https://compromise.cool/
[4]: https://spacy.io/
[5]: https://huggingface.co/learn/llm-course/chapter6/5
[6]: https://github.com/martianmartina/TreeTokenizer/tree/main
[7]: https://www.vennify.ai/fine-tune-grammar-correction/

# text editor

I want to provide the best reading experience, which also means the best
editing experience. Authors should be able to verify what readers will see and
readers should be able to tweak content to their understanding.

There are some complicated writer features: namely annotations and source maps.

Writing a rich text editor that works in a browser is difficult. Thankfully,
there's a new viable library [Wordgard](1) that works extremely well. Its author
has written widely used [rich text](2) and [code editors](3) and [is very
responsive.](4)

There were a few others that failed to deliver as nice an experience:
- [Prosemirror](2)
	- Difficult to get schema working, plugin system was unwieldy and scaled
    poorly.
- [Lexical](https://lexical.dev/)
	- Vendor-locked to React.
- [Slate](https://www.slatejs.org/examples/richtext)
	- Vendor-locked to React.
- [Quill](https://quilljs.com/)
	- Flat-content model scaled very poorly.
	- No tree-shaking.
	- Poor support.

[1]: https://wordgard.net
[2]: http://prosemirror.net
[3]: http://codemirror.net
[4]: https://code.haverbeke.berlin/wordgard/wordgard/issues

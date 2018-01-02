---
title: Link Tests
...

## Positives

[Simple](index.md)

* In text [index.html](index.md).
* With path [dir/subdir/index.html](dir/subdir/index.md)
* With parent path [../../index.html](../../index.md)
* With spaces in Label [Link To](index.md)
* With spaces in URL [Link](sub%20dir/my%20document.md)
* Hash only [#chapter_1](#chapter_1)
* With hash [index.html#chapter_1](index.md#chapter_1)
* Suppress query [index.html](index.md?abc=123&def=2)
* With hash, suppress query [index.html#chapter_1](index.md?abc=123#chapter_1)
* Complex [../sibling/subdir/document.html#ch_1](../sibling/subdir/document.md?abc=1&def=2#ch_1)
* Empty [](index.md)
* Recurring implicit [GitHub1]
* Recurring explicit [GitHub][GitHub2]

## Negatives

![Image](images/picture.png)

* Other Extension [Document](doc.pdf)
* Absolute [URL](https://github.com/mastersign/mddata/blob/master/README.md)
* Empty [Empty]()
* With spaces in URL [Spaces](my document.md)

[GitHub1]: http://www.github.com
[GitHub2]: https://github.com/ "With a nice title."

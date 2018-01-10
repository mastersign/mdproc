---
author: John Smith
title: Example Document
subtitle: Markdown Mix
lang: en
---

# Introduction

This document is a more complex example of all things working together.

::: {.badge .passive}
It will pe brought to its _shiny_ **glory** by [Gulp].
:::

![#img:autograph Autograph Image](images/auto/complex_auto)

* [Text Include]
* [CSV Include]
* [Images]

# Text Include { #inc:text }
<!-- #state open -->

<!-- #include includes/simple.inc.md -->

# CSV Include
[In Progress]{.badge .highlight}

<!-- #csv includes/table.csv -->

# Images

<!-- #badge warning Unfinished! -->

* [#img:auto]
* [#img:png]

Picture with multiple formats:

![#img:auto Example](images/example)

Picture with PNG format:

![#img:png PNG Picture](images/picture.png)


[Gulp]: http://gulpjs.com

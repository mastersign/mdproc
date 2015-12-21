
---
title: Vorgangsbegleiter
subtitle: Product Backlog
author: Tobias Kiertscher
creator:
- role: Autor
  name: Tobias Kiertscher
  email: tkiertscher@ifg.cc
date: 21.08.2014
lang: de
...

<!-- @graph ProductBacklog -->
<!-- @edge-type dependency-or: color=dodgerblue4, style=dashed, arrowhead=vee -->
<!-- @edge-type dependency: color=dodgerblue4, style=solid, arrowhead=vee -->
<!-- @node-type user-story-open: shape=rect, style="filled,rounded", color=dodgerblue3, fillcolor=lightskyblue1 -->
<!-- @node-type user-story-marked: shape=rect, style="filled,rounded", color=goldenrod3, fillcolor=gold1 -->
<!-- @node-type user-story-closed: shape=rect, style="filled,rounded", color=green3, fillcolor=olivedrab1 -->

[Zurück zum Index](index.md)

# Übersicht

![](images/auto/backlog_dotex)

blaue Form
  ~ User Story die noch nicht bearbeitet wurde

grüne Form
  ~ User Story die bearbeitet wurde

durchgezogener Pfeil
  ~ Abhängigkeit

gestrichelter Pfeil
  ~ alternative Abhängigkeit

# User Stories

## 01 Prozesslandschaft
<!-- @node Prozesslandschaft <user-story-open>: URL="#prozesslandschaft" -->

**Als ...** 
Sachbearbeiter

**möchte ich ...**
von der Startseite ausgehend eine grafische Darstellung der Prozesslandschaft aufrufen

**um ...**
mir eine Übersicht über alle Prozesse und Prozessinfos zu verschaffen

**damit ...**
ich einen Prozess auswählen kann

## 02 Alphabetische Prozessliste
<!-- @node Alphabetische Prozessliste <user-story-closed>: URL="#alphabetische-prozessliste" -->

**Als ...**
Sachbearbeiter

**möchte ich ...**
von der Startseite ausgehend eine alphabetische Liste aller Prozesse und Prozessinfos aufrufen

**um ...**
einen Prozess anhand seines Namens zu finden

**damit ...**
ich einen Prozess auswählen kann

### Tasks

#### 02.0 Project Setup
<!-- #state closed -->

Artefakte: Projektverzeichnis mit
* `README.md`
* `package.json` (Node.JS Package Manager)
* `bower.json` (Bower)
* `config.xml` (Cordova Web App)
* `gulpfile.js`, `build_config.js` (Gulp Build-Automation)
* `src/index.html` (HTML Single-Page Rahmen)
* `src/views/`
    - `home.html`
    - `info.html`
    - `admin.html`
* `src/style/`
    - `main.less`
* `src/app/`
    - `main.js`
    - `services.js`
    - `controllers.js`
    - `directives.js`

#### 02.1 ProcessList (Service)
<!-- #state closed -->

Artefakt: [processList (Service)](architecture.md#processlist)

#### 02.2 ProcessList (Controller)
<!-- #state closed -->

Artefakt: [ProcessListController](architecture.md#processlistcontroller)

#### 02.3 ProcessList (Directive)
<!-- #state closed -->

Artefakte:
[ProcessList (Directive)](architecture.md#cd-process-list),
`templates/process-list.html`,
`style/process-list.less`

#### 02.4 ProcessList (View)
<!-- #state closed -->

Artefakt: `views/process-list.html`

* Route für `/list`
* Route für `/list/<char>`
* Link von `index.html`
* Link von Menü

## 03 Schnellaufruf
<!-- @node Schnellaufruf <user-story-open>: URL="#schnellaufruf" -->

**Als ...**
Sachbearbeiter

**möchte ich ...**
von der Startseite ausgehend eine Liste der Prozesse aufrufen, die begleitet werden können

**um ...**
nicht von der großen Anzahl an Prozessinfos abgelenkt zu werden

**damit ...**
ich schnell eine Prozessbegleitung starten kann

## 04 Prozessinfo
<!-- @node Prozessinfo <user-story-closed>: URL="#prozessinfo" -->
<!-- @edge Prozessinfo -> Prozesslandschaft <dependency-or> -->
<!-- @edge Prozessinfo -> Alphabetische Prozessliste <dependency-or> -->

*Abhängigkeiten*: 01 oder 02

**Als ...**
Sachbearbeiter

**möchte ich ...**
nach einer Prozessauwahl auf eine Prozessinfoseite gelangen

**um ...**
die Namen und eine Kurzbeschreibung anzuzeigen

**damit ...**
ich den Prozess kennenlernen bzw. gedanklich einordnen kann

### Tasks

#### 04.1 ProcessInfo (Controller)
<!-- #state closed -->

Artefakt: [ProcessInfoController](architecture.md#processinfocontroller)

#### 04.2 ProcessInfo (View)
<!-- #state closed -->

Artefakt: `views/process-info.html`

* Route für `/info/<pid>`
* Link von `views/process-list.html`

## 05 Prozesshervorhebung
<!-- @node Prozesshervorhebung <user-story-open>: URL="#prozesshervorhebung" -->
<!-- @edge Prozesshervorhebung -> Prozesslandschaft <dependency-or> -->
<!-- @edge Prozesshervorhebung -> Alphabetische Prozessliste <dependency-or> -->

*Abhängigkeiten:* 01 oder 02

**Als ...**
Sachbearbeiter

**möchte ich ...**
dass die Prozesse, die begleitet werden können, in der Prozesslandschaft und der alphabetischen Prozessliste grafisch hervorgehoben werden

**um ...**
schneller zu erkennen welche Prozesse für die Begleitung implementiert sind

**damit ...**
ich nicht erwarte, dass ich alle Prozesse begleiten kann

## 06 Prozessdiagramm
<!-- @node Prozessdiagramm <user-story-open>: URL="#prozessdiagramm" -->
<!-- @edge Prozessdiagramm -> Prozessinfo <dependency> -->

*Abhängigkeiten:* 04

**Als ...**
Sachbearbeiter

**möchte ich ...**
von der Prozessinfoseite eine grafische Darstellung des Prozesses aufrufen

**um ...**
die Arbeitsschritte des Prozesses und ihre Zusammenhänge kennen zu lernen

**damit ...**
ich verstehe wie umfangreich der Prozess ist und welche Akteure beteiligt sind

## 07 Prozessbegleitung starten
<!-- @node Begleitung starten <user-story-marked>: URL="#prozessbegleitung-starten" -->
<!-- @edge Begleitung starten -> Prozessinfo <dependency-or> -->
<!-- @edge Begleitung starten -> Schnellaufruf <dependency-or> -->

*Abhängigkeiten:* 03 oder 04

**Als ...**
Sachbearbeiter

**möchte ich ...**
von einer Prozessinfoseite oder aus der Schnellaufrufliste die Begleitung eines Prozesses starten

**um ...**
die Anwendung in den Modus für die Prozessbegleitung zu versetzen

**damit ...**
anschließend die Prozessbegleitung an prominenter Stelle auf der Startseite angezeigt wird, ich die Durchführung von Prozessschritten notieren kann und keine weitere Prozessbegleitung gestartet werden kann

### Tasks

#### 07.1 Beispielprozess kodieren
<!-- #state closed -->
Datenmodell für Prozesse verfeinern und einen Beispielprozess in JSON kodieren.

Artefakte: 
* `data/P00EX.json`
* zusätzlicher Eintrag in `data/landscape.json` für `P00EX`

#### 07.2 ProcessList (Service) erweitern
<!-- #state in-progress -->

Artefakt: `processList.getProcess(pID)`

#### 07.3 Storage (Service)
<!-- #state open -->
Minimale Funktionalität mit *Indexed DB API* implementieren: `storage.startTrace(...)`.

Artefakt: `storage`

#### 07.4 TraceStart (View)
<!-- #state open -->

Artefakte:

* `TraceStartController`
* `views/trace-start.html`
* Route für `/starttrace`
* Links in `views/process-list.html`

#### 07.5 Verlinkung
<!-- #state open -->

Artefakte:
* Bedingter Link auf Startseite für das Fortsetzen der Begleitung
* Links für das Starten der Begleitung in `views/process-list.html` bedingt ausblenden

## 08 Teilprozessbegleitung starten
<!-- @node Teilbegleitung starten <user-story-open>: URL="#teilprozessbegleitung-starten" -->
<!-- @edge Teilbegleitung starten -> Begleitung starten <dependency> -->

*Abhängigkeiten:* 07

**Als ...**
Sachbearbeiter

**möchte ich ...**
beim Starten einer Prozessbegleitung alternativ zur vollständigen Begleitung den ersten zu begleitenden Prozessschritt und die letzten zu begleitenden Prozessschritte auswählen

**um ...**
einen Teilprozess zu definieren der begleitet werden soll

**damit ...**
ich mehr Flexibilität bei der Begleitung erhalte und evtl. auf organisatorische Randbedingungen reagieren kann oder einen kritischen Teilprozess häufiger begleiten kann

## 09 Arbeitsschritt beginnen
<!-- @node Arbeitsschritt beginnen <user-story-marked>: URL="#arbeitsschritt-beginnen" -->
<!-- @edge Arbeitsschritt beginnen -> Begleitung starten <dependency> -->

*Abhängigkeiten:* 07

**Als ...**
Sachbearbeiter

**möchte ich ...**
während einer Prozessbegleitung den Beginn der Arbeit an einem Arbeitsschritt notieren

**um ...**
die bestehende Ruhezeit zu beenden, den Fortschritt des Prozesses anzugeben und den Zeitpunkt des Arbeitsbeginns festzuhalten

**damit ...**
bei der Auswertung festgestellt werden kann, dass der Arbeitsschritt wie erfasst durchgeführt wurde und wie lange die vorangegangene Ruhezeit gedauert hat

## 10 Arbeitsschritt beenden
<!-- @node Arbeitsschritt beenden <user-story-marked>: URL="#arbeitsschritt-beenden" -->
<!-- @edge Arbeitsschritt beenden -> Arbeitsschritt beginnen <dependency> -->

*Abhängigkeiten:* 07

**Als ...**
Sachbearbeiter

**möchte ich...**
während einer Prozessbegleitung den Abschluss der Arbeit an einem Arbeitsschritt notieren, optional die Art der folgenden Ruhezeit und bei Verzweigungen den nachfolgenden Arbeitsschritt auswählen

**um ...**
den Arbeitsschritt zu beenden, den Fortschritt des Prozesses anzugeben und den Zeitpunkt der Ruhezeit festzuhalten

**damit ...**
bei der Auswertung festgestellt werden kann, wie lange die Bearbeitungszeit gedauert hat

## 11 Feedback geben
<!-- @node Feedback geben <user-story-open>: URL="#feedback-geben" -->
<!-- @edge Feedback geben -> Arbeitsschritt beginnen <dependency-or> -->
<!-- @edge Feedback geben -> Arbeitsschritt beenden <dependency-or> -->

*Abhängigkeiten:* 09 und 10

**Als ...**
Sachbearbeiter

**möchte ich ...**
während der Begleitung eines Arbeitsschritts oder einer Ruhezeit eine Abweichung oder einen Kommentar notieren

**um ...**
Abweichungen zwischen dem modellierten Prozess und dem realen Prozess festzuhalten

**damit ...**
anschließend an die Auswertung der modellierte Prozess angepasst oder der reale Prozess korrigiert werden kann

Arten von Feedback sind:

* fehlender Arbeitsschritt
* überflüssiger Arbeitsschritt
* fehlende reguläre Ruhezeit
* überflüssige reguläre Ruhezeit
* sonstiger Kommentar

## 12 Prozessbegleitung abschließen
<!-- @node Begleitung abschließen <user-story-marked>: URL="#prozessbegleitung-abschließen" -->
<!-- @edge Begleitung abschließen -> Arbeitsschritt beenden <dependency> -->

*Abhängigkeiten:* 07

**Als ...**
Sachbearbeiter

**möchte ich ...**
dass nach Abschluss der Arbeit an einem letzten zu begleitenden Arbeitsschritt beendet wird, eine Zusammenfassung der Prozessbegleitung angezeigt wird

**um ...**
die Anwendung aus dem Modus für die Prozessbegleitung in den *normalen* Modus zu versetzen

**damit ...**
anschließend die letzte Prozessbegleitung von der Startseite genommen wird und eine neue Begleitung gestartet werden kann

## 13 Prozessbegleitung abbrechen
<!-- @node Begleitung abbrechen <user-story-open>: URL="#prozessbegleitung-abbrechen" -->
<!-- @edge Begleitung abbrechen -> Begleitung starten <dependency> -->

*Abhängigkeiten:* 07

**Als ...**
Sachbearbeiter

**möchte ich ...**
während einer Prozessbegleitung die Möglichkeit haben, die Begleitung vorzeitig zu beenden

**um ...**
die Anwendung aus dem Modus für die Prozessbegleitung in den *normalen* Modus zu versetzen

**damit ...**
ich auf organisatorische Randbedingungen reagieren kann oder eine Begleitung, die nicht sinnvoll durchgeführt wird, verwerfen kann

## 14 Prozessbegleitdaten übermitteln
<!-- @node Daten übermitteln <user-story-open>: URL="#prozessbegleitdaten-übermitteln" -->
<!-- @edge Daten übermitteln -> Begleitung abschließen <dependency> -->

*Abhängigkeiten:* 12

**Als ...**
Analyst

**möchte ich ...**
dass die Anwendung die Konnektivität zum Internet überwacht 

**um ...**
bei bestehender Verbindung alle noch nicht übermittelten Prozessbegleitdaten der abgeschlossenen Prozessbegleitungen per Email an mich zu übermitteln

**damit ...**
der Sachbearbeiter den Übermittlungsvorgang nicht aktiv anstoßen muss und mir die Prozessbegleitdaten so früh wie möglich zur Analyse vorliegen

## 15 Verbindungsstatus anzeigen
<!-- @node Verbindungsstatus anzeigen <user-story-open>: URL="#verbindungsstatus-anzeigen" -->

**Als ...**
Sachbearbeiter

**möchte ich ...**
den Status der Konnektivität der Anwendung zum Internet sehen

**um ...**
einschätzen zu können, wann die Begleitdaten übermittelt werden können

**damit ...**
ich nachvollziehen kann, dass mein Versuch das Tablet mit dem Internet zu verbinden erfolgreich war

## 16 Datenstatus anzeigen
<!-- @node Datenstatus anzeigen <user-story-open>: URL="#datenstatus-anzeigen" -->
<!-- @edge Datenstatus anzeigen -> Daten übermitteln <dependency> -->

*Abhängigkeiten:* 14

**Als ...**
Sachbearbeiter

**möchte ich ...**
die Anzahl der bereits übermmittelten und der noch nicht übermittelten Prozessbegleitdaten sehen

**um ...**
einschätzen zu können, wie dringend das Tablet mit dem Internet verbunden werden muss oder ob die Prozessbegleitdaten bei bestehender Verbindung erfolgreich übermittelt wurden

**damit ...**
ich darüber informiert bin, ob und ab wann die Prozessbegleitdaten zur Analyse übermittelt wurden

## 17 Zurücksetzen
<!-- @node Zurücksetzen <user-story-open>: URL="#zurücksetzen" -->

**Als ...**
Analyst

**möchte ich ...**
eine durch Rückfrage abgesicherte Möglichkeit, die Anwendung zurückzusetzen

**um ...**
alle noch in der Anwendung gespeicherten Prozessbegleitdaten zu löschen

**damit ...**
das Tablet für die Prozesserfassung an anderer Stelle verwendet werden kann und potentielle Statistiken in der Anwendung neu beginnen

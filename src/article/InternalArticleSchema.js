import {
  DocumentSchema, DocumentNode, InlineNode,
  XMLContainerNode, XMLElementNode, XMLTextElement
} from 'substance'
import { BOOLEAN, STRING, TEXT, MANY, ONE, CHILDREN, CHILD } from '../kit'
import { INTERNAL_BIBR_TYPES } from './ArticleConstants'
import InternalArticleDocument from './InternalArticleDocument'
// TODO: rename this to *Schema
import TextureArticleSchema from './TextureArticle'
import TableNode from './TableNode'
import TableCellNode from './TableCellNode'
import ListNode from './XMLListNode'
import ListItemNode from './XMLListItemNode'

const RICH_TEXT_ANNOS = ['bold', 'italic', 'sup', 'sub']

class Article extends XMLElementNode {}
Article.schema = {
  type: 'article',
  _childNodes: CHILDREN('metadata', 'content')
}

class ArticleRecord extends DocumentNode {}
ArticleRecord.schema = {
  type: 'article-record',
  volume: STRING,
  issue: STRING,
  fpage: STRING,
  lpage: STRING,
  pageRange: STRING,
  elocationId: STRING,
  acceptedDate: STRING,
  publishedDate: STRING,
  receivedDate: STRING,
  revReceivedDate: STRING,
  revRequestedDate: STRING,
  copyrightStatement: 'text',
  copyrightYear: 'text',
  copyrightHolder: 'text',
  // URL to license description
  // used as a unique license identifier
  license: 'text',
  // Optional: A paragraph holding the license text if needed
  licenseText: 'text'
}

class TranslatableTextElement extends XMLTextElement {
  getTranslations () {
    const doc = this.getDocument()
    return this.translations.map(id => doc.get(id)).filter(Boolean)
  }
}
TranslatableTextElement.schema = {
  translations: CHILDREN('text-translation')
}

class TranslatableContainerElement extends XMLContainerNode {
  getTranslations () {
    const doc = this.getDocument()
    return this.translations.map(id => doc.get(id)).filter(Boolean)
  }
}
TranslatableContainerElement.schema = {
  translations: CHILDREN('container-translation')
}

class Metadata extends XMLElementNode {}
Metadata.schema = {
  type: 'metadata',
  _childNodes: CHILDREN(
    'article-record', 'authors', 'editors', 'groups', 'organisations', 'awards', 'keywords', 'subjects'
  )
}

class Organisations extends XMLElementNode {}
Organisations.schema = {
  type: 'organisations',
  _childNodes: CHILDREN(...INTERNAL_BIBR_TYPES)
}

class Authors extends XMLElementNode {}
Authors.schema = {
  type: 'authors',
  _childNodes: CHILDREN('person')
}

class Editors extends XMLElementNode {}
Editors.schema = {
  type: 'editors',
  _childNodes: CHILDREN('person')
}

class DispQuote extends XMLContainerNode {}
DispQuote.schema = {
  type: 'disp-quote',
  attrib: 'text',
  _childNodes: CHILDREN('p')
}

class Figure extends DocumentNode {
  getContent () {
    return this.getDocument().get(this.content)
  }
  getCaption () {
    return this.getDocument().get(this.caption)
  }
}

Figure.schema = {
  type: 'figure',
  content: CHILD('graphic'),
  title: TEXT(...RICH_TEXT_ANNOS),
  label: STRING,
  caption: CHILD('caption'),
  permission: CHILD('permission')
}

class TableFigure extends Figure {}
TableFigure.schema = {
  type: 'table-figure',
  content: CHILD('table')
}

class Groups extends XMLElementNode {}
Groups.schema = {
  type: 'groups',
  _childNodes: CHILDREN('group')
}

class Awards extends XMLElementNode {}
Awards.schema = {
  type: 'awards',
  _childNodes: CHILDREN('award')
}

class Keywords extends XMLElementNode {}
Keywords.schema = {
  type: 'keywords'
}

class Subjects extends XMLElementNode {}
Subjects.schema = {
  type: 'subjects'
}

// TODO: as this node has a fixed layout, we might want to use a classical DocumentNode
// But this needs support for CSS select
class Content extends XMLElementNode {}
Content.schema = {
  type: 'content',
  _childNodes: CHILDREN('front', 'body', 'back')
}

class Front extends XMLElementNode {}
Front.schema = {
  type: 'front',
  _childNodes: CHILDREN('title', 'abstract')
}

class Back extends XMLElementNode {}
Back.schema = {
  type: 'back',
  _childNodes: CHILDREN('references', 'footnotes')
}

class Title extends TranslatableTextElement {}
Title.schema = {
  type: 'title',
  content: TEXT(...RICH_TEXT_ANNOS)
}

class Abstract extends TranslatableContainerElement {}
Abstract.type = 'abstract'

class Heading extends XMLTextElement {
  getLevel () {
    return parseInt(this.getAttribute('level') || '1', 10)
  }
  setLevel (level) {
    this.setAttribute('level', String(level))
  }
}
Heading.type = 'heading'

class References extends XMLElementNode {}
References.schema = {
  type: 'references',
  _childNodes: CHILDREN(...INTERNAL_BIBR_TYPES)
}

class Footnotes extends XMLElementNode {}
Footnotes.schema = {
  type: 'footnotes',
  _childNodes: CHILDREN('fn')
}

// TODO: move all of this into InternalArticleSchema

class BibliographicEntry extends DocumentNode {}
BibliographicEntry.schema = {
  type: 'bibr'
}

class Book extends BibliographicEntry {}
Book.schema = {
  type: 'book',
  authors: CHILDREN('ref-contrib'),
  editors: CHILDREN('ref-contrib'),
  translators: CHILDREN('ref-contrib'),
  title: TEXT(...RICH_TEXT_ANNOS),
  volume: STRING,
  edition: STRING,
  publisherLoc: STRING,
  publisherName: STRING,
  year: STRING,
  month: STRING,
  day: STRING,
  pageCount: STRING,
  series: STRING,
  doi: STRING,
  isbn: STRING,
  pmid: STRING
}

class Chapter extends BibliographicEntry {}
Chapter.schema = {
  type: 'chapter',
  title: TEXT(...RICH_TEXT_ANNOS), // <chapter-title>
  containerTitle: STRING, // <source>
  volume: STRING,
  authors: CHILDREN('ref-contrib'), // <person-group person-group-type="author">
  editors: CHILDREN('ref-contrib'),
  translators: CHILDREN('ref-contrib'),
  edition: STRING,
  publisherLoc: STRING,
  publisherName: STRING,
  year: STRING,
  month: STRING,
  day: STRING,
  fpage: STRING,
  lpage: STRING,
  pageRange: STRING,
  elocationId: STRING,
  series: STRING,
  doi: STRING, // <pub-id pub-id-type="doi">
  isbn: STRING, // <pub-id pub-id-type="isbn">
  pmid: STRING // <pub-id pub-id-type="pmid">
}

class ConferencePaper extends BibliographicEntry {}
ConferencePaper.schema = {
  type: 'conference-paper',
  title: TEXT(...RICH_TEXT_ANNOS), // <article-title>
  authors: CHILDREN('ref-contrib'),
  confName: STRING,
  confLoc: STRING,
  containerTitle: STRING, // <source>
  year: STRING,
  month: STRING,
  day: STRING,
  fpage: STRING,
  lpage: STRING,
  pageRange: STRING,
  elocationId: STRING,
  doi: STRING
}

class DataPublication extends BibliographicEntry {}
DataPublication.schema = {
  type: 'data-publication',
  title: TEXT(...RICH_TEXT_ANNOS),
  authors: CHILDREN('ref-contrib'),
  containerTitle: STRING, // <source>
  year: STRING,
  month: STRING,
  day: STRING,
  accessionId: STRING,
  arkId: STRING,
  archiveId: STRING,
  doi: STRING
}

class JournalArticle extends BibliographicEntry {}
JournalArticle.schema = {
  type: 'journal-article',
  title: TEXT(...RICH_TEXT_ANNOS),
  authors: CHILDREN('ref-contrib'),
  editors: CHILDREN('ref-contrib'),
  containerTitle: STRING, // <source>
  volume: STRING,
  issue: STRING,
  year: STRING,
  month: STRING,
  day: STRING,
  fpage: STRING,
  lpage: STRING,
  pageRange: STRING,
  elocationId: STRING,
  doi: STRING,
  pmid: STRING
}

class MagazineArticle extends BibliographicEntry {}
MagazineArticle.schema = {
  type: 'magazine-article',
  title: TEXT(...RICH_TEXT_ANNOS),
  authors: CHILDREN('ref-contrib'),
  containerTitle: STRING, // <source>
  year: STRING,
  month: STRING,
  day: STRING,
  volume: STRING,
  fpage: STRING,
  lpage: STRING,
  pageRange: STRING,
  doi: STRING
}

class NewspaperArticle extends BibliographicEntry {}
NewspaperArticle.schema = {
  type: 'newspaper-article',
  title: TEXT(...RICH_TEXT_ANNOS),
  authors: CHILDREN('ref-contrib'),
  containerTitle: STRING, // <source>
  year: STRING,
  month: STRING,
  day: STRING,
  volume: STRING,
  fpage: STRING,
  lpage: STRING,
  pageRange: STRING,
  doi: STRING,
  edition: STRING,
  partTitle: STRING
}

class Patent extends BibliographicEntry {}
Patent.schema = {
  type: 'patent',
  inventors: CHILDREN('ref-contrib'),
  assignee: STRING,
  title: TEXT(...RICH_TEXT_ANNOS),
  containerTitle: STRING, // <source>
  year: STRING,
  month: STRING,
  day: STRING,
  patentNumber: STRING,
  patentCountry: STRING,
  doi: STRING
}

class Permission extends DocumentNode {}
Permission.schema = {
  type: 'permission',
  copyrightStatement: 'text',
  copyrightYear: 'text',
  copyrightHolder: 'text',
  // URL to license description
  // used as a unique license identifier
  license: 'text',
  // Optional: A paragraph holding the license text if needed
  licenseText: 'text'
}

class Report extends BibliographicEntry {
  getGuid () {
    return this.isbn
  }
}
Report.schema = {
  type: 'report',
  authors: CHILDREN('ref-contrib'),
  sponsors: CHILDREN('ref-contrib'),
  title: TEXT(...RICH_TEXT_ANNOS),
  year: STRING,
  month: STRING,
  day: STRING,
  publisherName: STRING,
  publisherLoc: STRING,
  series: STRING,
  isbn: STRING,
  doi: STRING
}

class Software extends BibliographicEntry {}
Software.schema = {
  type: 'software',
  title: TEXT(...RICH_TEXT_ANNOS),
  authors: CHILDREN('ref-contrib'),
  version: STRING,
  publisherLoc: STRING,
  publisherName: STRING,
  year: STRING,
  month: STRING,
  day: STRING,
  doi: STRING
}

class Thesis extends BibliographicEntry {}
Thesis.schema = {
  type: 'thesis',
  title: TEXT(...RICH_TEXT_ANNOS),
  authors: CHILDREN('ref-contrib'),
  year: STRING,
  month: STRING,
  day: STRING,
  publisherLoc: STRING,
  publisherName: STRING,
  doi: STRING
}

class Webpage extends BibliographicEntry {}
Webpage.schema = {
  type: 'webpage',
  title: TEXT(...RICH_TEXT_ANNOS),
  // E.g. website name, where the page appeared
  containerTitle: STRING, // <source>
  authors: CHILDREN('ref-contrib'),
  year: STRING,
  month: STRING,
  day: STRING,
  publisherLoc: STRING,
  uri: STRING
}

class Person extends DocumentNode {
  getBio () {
    return this.getDocument().get(this.bio)
  }
}

Person.schema = {
  type: 'person',
  surname: STRING,
  givenNames: STRING,
  alias: STRING,
  prefix: STRING,
  suffix: STRING,
  email: STRING,
  orcid: STRING,
  group: ONE('group'),
  affiliations: MANY('organisation'),
  awards: MANY('award'),
  bio: CHILD('bio'),
  equalContrib: BOOLEAN,
  corresp: BOOLEAN,
  deceased: BOOLEAN
}

/* Holds data for persons and instituions/groups in references */
export class RefContrib extends DocumentNode {}
RefContrib.schema = {
  type: 'ref-contrib',
  name: STRING, // either family name or institution name
  givenNames: STRING
}

class Award extends DocumentNode {}
Award.schema = {
  type: 'award',
  institution: STRING,
  fundRefId: STRING,
  awardId: STRING
}

export class Group extends DocumentNode {}
Group.schema = {
  type: 'group',
  name: STRING,
  email: STRING,
  affiliations: MANY('organisation'),
  awards: MANY('award'),
  equalContrib: BOOLEAN,
  corresp: BOOLEAN
}

class Keyword extends DocumentNode {}
Keyword.schema = {
  type: 'keyword',
  name: STRING,
  category: STRING,
  language: STRING
}

export class Organisation extends DocumentNode {}
Organisation.schema = {
  type: 'organisation',
  name: STRING,
  division1: STRING,
  division2: STRING,
  division3: STRING,
  // Consider switching to address-line1,2,3
  street: STRING,
  addressComplements: STRING,
  city: STRING,
  state: STRING,
  postalCode: STRING,
  country: STRING,
  phone: STRING,
  fax: STRING,
  email: STRING,
  uri: STRING
}

class Subject extends DocumentNode {}
Subject.schema = {
  type: 'subject',
  name: STRING,
  category: STRING,
  language: STRING
}

class ContainerTranslation extends XMLContainerNode {}
ContainerTranslation.schema = {
  type: 'container-translation',
  language: STRING
}

class TextTranslation extends XMLTextElement {}
TextTranslation.schema = {
  type: 'text-translation',
  language: STRING
}

class TableRow extends XMLElementNode {}
TableRow.schema = {
  type: 'table-row',
  _childNodes: CHILDREN('table-cell')
}

class UnsupportedNode extends DocumentNode {}
UnsupportedNode.schema = {
  type: 'unsupported-node',
  data: 'string'
}

class UnsupportedInlineNode extends InlineNode {}
UnsupportedInlineNode.schema = {
  type: 'unsupported-inline-node',
  data: 'string'
}

const InternalArticleSchema = new DocumentSchema({
  name: 'TextureInternalArticle',
  version: '0.1.0',
  DocumentClass: InternalArticleDocument,
  // HACK: still necessary
  // Instead we should find a general way
  defaultTextType: 'p'
})

InternalArticleSchema.addNodes([
  Article,
  // metadata
  Metadata,
  ArticleRecord,
  Organisations,
  Authors,
  Awards,
  Groups,
  Editors,
  Keywords,
  Subjects,
  // entities used in metadata
  Award,
  Group,
  Person,
  Organisation,
  Keyword,
  Subject,
  // content
  Abstract,
  Back,
  Content,
  DispQuote,
  Figure,
  Footnotes,
  Front,
  Heading,
  ListNode,
  ListItemNode,
  References,
  TableNode,
  TableFigure,
  TableRow,
  TableCellNode,
  Title,
  // bibliography
  BibliographicEntry,
  Book,
  Chapter,
  ConferencePaper,
  DataPublication,
  JournalArticle,
  MagazineArticle,
  NewspaperArticle,
  Report,
  Patent,
  Permission,
  Software,
  Thesis,
  Webpage,
  // entity used in bibliography
  RefContrib,
  // translations
  TextTranslation,
  ContainerTranslation,
  // others
  UnsupportedNode,
  UnsupportedInlineNode
])

// Elements taken from the JATS spec
// TODO: make sure that we do not need to modify them, e.g. marking them as inline nodes
InternalArticleSchema.addNodes([
  'body',
  'bio',
  'caption',
  'fn',
  'graphic',
  'label',
  'p',
  'tex-math',
  // formatting
  'bold',
  'fixed-case',
  'italic',
  'monospace',
  'overline',
  'roman',
  'sans-serif',
  'sc',
  'strike',
  'sub',
  'sup',
  'underline',
  'ruby',
  // annos and inline-nodes
  'abbrev',
  'break',
  'chem-struct',
  'ext-link',
  'hr',
  'named-content',
  'inline-formula',
  'inline-graphic',
  'styled-content',
  'x',
  'xref'
].map(name => TextureArticleSchema.getNodeClass(name, 'strict')))

export default InternalArticleSchema

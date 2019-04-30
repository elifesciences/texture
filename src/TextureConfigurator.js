import {
  flatten, isString, isFunction, platform, DefaultLabelProvider, FontAwesomeIconProvider
} from 'substance'
import { SwitchTextTypeCommand } from './kit'

export default class TextureConfigurator {
  constructor (parent, name) {
    this.parent = parent
    this.name = name

    this._subConfigurations = new Map()
    this._values = new Map()
    this._commands = new Map()
    this._commandGroups = new Map()
    this._components = new Map()
    this._converters = new Map()
    this._documentLoaders = new Map()
    this._documentSerializers = new Map()
    this._dropHandlers = []
    this._exporters = new Map()
    this._icons = new Map()
    this._importers = new Map()
    this._keyboardShortcuts = []
    this._keyboardShortcutsByCommandName = new Map()
    this._labels = new Map()
    this._nodes = new Map()
    this._toolPanels = new Map()

    // hierarchical registries
    this._valuesRegistry = new HierarchicalRegistry(this, '_values')
    this._commandRegistry = new HierarchicalRegistry(this, '_commands')
    this._componentRegistry = new HierarchicalRegistry(this, '_components')
    this._iconRegistry = new HierarchicalRegistry(this, '_icons')
    this._labelRegistry = new HierarchicalRegistry(this, '_labels')

    // TODO: document why this is necessary, beyond legacy reasons
    this._compiledToolPanels = new Map()
  }

  import (pkg, options) {
    pkg.configure(this, options || {})
    return this
  }

  createSubConfiguration (name, options = {}) {
    let ConfiguratorClass = options.ConfiguratorClass || this.constructor
    let subConfig = new ConfiguratorClass(this, name)
    this._subConfigurations.set(name, subConfig)
    return subConfig
  }

  getConfiguration (path) {
    // TODO: implement this in a strict way
    if (isString(path)) {
      path = path.split('.')
    }
    let subConfig = this._subConfigurations.get(path[0])
    if (path.length === 1) {
      return subConfig
    } else {
      if (subConfig) {
        return subConfig.getConfiguration(path.slice(1))
      }
    }
  }

  getValue (key) {
    return this._valuesRegistry.get(key)
  }

  setValue (key, value) {
    this._values.set(key, value)
  }

  addCommand (name, CommandClass, options = {}) {
    this._commands.set(name, new CommandClass(Object.assign({ name }, options)))
    if (options.commandGroup) {
      this._addCommandToCommandGroup(name, options.commandGroup)
    }
    if (options.accelerator) {
      this.addKeyboardShortcut(options.accelerator, { command: name })
    }
  }

  addComponent (name, ComponentClass) {
    this._components.set(name, ComponentClass)
  }

  addConverter (format, converter) {
    let converters = this._converters.get(format)
    if (!converters) {
      converters = new Map()
      this._converters.set(format, converters)
    }
    if (isFunction(converter)) {
      let ConverterClass = converter
      converter = new ConverterClass()
    }
    if (!converter.type) {
      throw new Error('A converter needs an associated type.')
    }
    converters.set(converter.type, converter)
  }

  addDropHandler (dropHandler) {
    this._dropHandlers.push(dropHandler)
  }

  addExporter (format, ExporterClass, spec = {}) {
    if (this._exporters.has(format)) throw new Error(`Exporter already registered for '${format}'`)
    this._exporters.set(format, {
      ExporterClass,
      spec
    })
  }

  addIcon (iconName, options) {
    if (!this._icons.has(iconName)) {
      this._icons.set(iconName, {})
    }
    let iconConfig = this._icons.get(iconName)
    Object.assign(iconConfig, options)
  }

  addImporter (format, ImporterClass, spec = {}) {
    if (this._importers.has(format)) throw new Error(`Importer already registered for '${format}'`)
    this._importers.set(format, {
      ImporterClass,
      spec
    })
  }

  addLabel (labelName, label) {
    let labels
    if (isString(label)) {
      labels = { en: label }
    } else {
      labels = label
    }
    this._labels.set(labelName, labels)
  }

  addNode (NodeClass) {
    let type = NodeClass.type
    if (this._nodes.has(type)) {
      throw new Error(`Node class for type '${type}' already registered`)
    }
    this._nodes.set(type, NodeClass)
  }

  addKeyboardShortcut (combo, spec) {
    let label = combo.toUpperCase()
    if (platform.isMac) {
      label = label.replace(/CommandOrControl/i, '⌘')
      label = label.replace(/Ctrl/i, '^')
      label = label.replace(/Shift/i, '⇧')
      label = label.replace(/Enter/i, '↵')
      label = label.replace(/Alt/i, '⌥')
      label = label.replace(/\+/g, '')
    } else {
      label = label.replace(/CommandOrControl/i, 'Ctrl')
    }
    let entry = {
      key: combo,
      label,
      spec
    }
    this._keyboardShortcuts.push(entry)
    if (spec.command) {
      this._keyboardShortcutsByCommandName.set(spec.command, entry)
    }
  }

  // TODO: this should be a helper, if necessary at all
  addTextTypeTool (spec) {
    this.addCommand(spec.name, SwitchTextTypeCommand, {
      spec: spec.nodeSpec,
      commandGroup: 'text-types'
    })
    this.addIcon(spec.name, { 'fontawesome': spec.icon })
    this.addLabel(spec.name, spec.label)
    if (spec.accelerator) {
      this.addKeyboardShortcut(spec.accelerator, { command: spec.name })
    }
  }

  addToolPanel (name, spec) {
    this._toolPanels.set(name, spec)
  }

  registerDocumentLoader (docType, LoaderClass, spec = {}) {
    this._documentLoaders.set(docType, {
      LoaderClass,
      spec
    })
  }

  registerDocumentSerializer (docType, SerializerClass, spec = {}) {
    this._documentSerializers.set(docType, {
      SerializerClass,
      spec
    })
  }

  getCommands () {
    return this._commands
  }

  getCommandGroup (name) {
    return this._commandGroups.get(name) || []
  }

  getComponent (name) {
    return this.getComponentRegistry().get(name, 'strict')
  }

  getComponentRegistry () {
    return this._componentRegistry
  }

  getConverters (type) {
    if (this._converters.has(type)) {
      return Array.from(this._converters.get(type).values())
    } else {
      return []
    }
  }

  getDocumentLoader (type) {
    if (this._documentLoaders.has(type)) {
      let { LoaderClass, spec } = this._documentLoaders.get(type)
      return new LoaderClass(spec)
    }
  }

  getDocumentSerializer (type) {
    if (this._documentSerializers.has(type)) {
      let { SerializerClass, spec } = this._documentSerializers.get(type)
      return new SerializerClass(spec)
    }
  }

  getIconProvider () {
    return new FontAwesomeIconProvider(this._icons)
  }

  // TODO: the label provider should not be maintained by the configuration
  // instead by the app, because language should be part of the app state
  getLabelProvider () {
    return new LabelProvider(this)
  }

  createImporter (type, doc, options = {}) {
    if (this._importers.has(type)) {
      let { ImporterClass, spec } = this._importers.get(type)
      let converters = []
      if (spec.converterGroups) {
        for (let key of spec.converterGroups) {
          converters = converters.concat(this.getConverters(key))
        }
      } else {
        converters = this.getConverters(type)
      }
      return new ImporterClass(this, doc, Object.assign({}, options, { converters }))
    } else if (this.parent) {
      return this.parent.createImporter(type, doc, options)
    }
  }

  createExporter (type, doc, options = {}) {
    if (this._exporters.has(type)) {
      let { ExporterClass, spec } = this._exporters.get(type)
      let converters = []
      if (spec.converterGroups) {
        for (let key of spec.converterGroups) {
          converters = converters.concat(this.getConverters(key))
        }
      } else {
        converters = this.getConverters(type)
      }
      return new ExporterClass(this, doc, Object.assign({}, options, { converters }))
    } else if (this.parent) {
      return this.parent.createExporter(type, doc, options)
    }
  }

  getKeyboardShortcuts () {
    return this._keyboardShortcuts
  }

  /*
    Allows lookup of a keyboard shortcut by command name
  */
  getKeyboardShortcutsByCommandName (commandName) {
    return this._keyboardShortcutsByCommandName.get(commandName)
  }

  getNodes () {
    return this._nodes
  }

  getToolPanel (name, strict) {
    let toolPanelSpec = this._toolPanels.get(name)
    if (toolPanelSpec) {
      // return cache compiled tool-panels
      if (this._compiledToolPanels.has(name)) return this._compiledToolPanels.get(name)
      let toolPanel = toolPanelSpec.map(itemSpec => this._compileToolPanelItem(itemSpec))
      this._compiledToolPanels.set(name, toolPanel)
      return toolPanel
    } else if (strict) {
      throw new Error(`No toolpanel configured with name ${name}`)
    }
  }

  _addCommandToCommandGroup (commandName, commandGroupName) {
    if (!this._commandGroups.has(commandGroupName)) {
      this._commandGroups.set(commandGroupName, [])
    }
    let commands = this._commandGroups.get(commandGroupName)
    commands.push(commandName)
  }

  _compileToolPanelItem (itemSpec) {
    let item = Object.assign({}, itemSpec)
    let type = itemSpec.type
    switch (type) {
      case 'command': {
        if (!itemSpec.name) throw new Error("'name' is required for type 'command'")
        break
      }
      case 'command-group':
        return this.getCommandGroup(itemSpec.name).map(commandName => {
          return {
            type: 'command',
            name: commandName
          }
        })
      case 'switcher':
      case 'prompt':
      case 'group':
      case 'dropdown':
        item.items = flatten(itemSpec.items.map(itemSpec => this._compileToolPanelItem(itemSpec)))
        break
      case 'separator':
      case 'spacer':
        break
      default:
        throw new Error('Unsupported tool panel item type: ' + type)
    }
    return item
  }
}

class HierarchicalRegistry {
  constructor (config, key) {
    this._config = config
    this._key = key
  }

  get (name, strict) {
    let config = this._config
    const key = this._key
    while (config) {
      let registry = config[key]
      if (registry.has(name)) {
        return registry.get(name)
      } else {
        config = config.parent
      }
    }
    if (strict) throw new Error(`No value registered for name '${name}'`)
  }
}

class LabelProvider extends DefaultLabelProvider {
  constructor (config) {
    super()
    this.config = config
  }

  getLabel (name, params) {
    const lang = this.lang
    let spec = this.config._labelRegistry.get(name)
    if (!spec) return name
    let rawLabel = spec[lang] || name
    // If context is provided, resolve templates
    if (params) {
      return this._evalTemplate(rawLabel, params)
    } else {
      return rawLabel
    }
  }
}

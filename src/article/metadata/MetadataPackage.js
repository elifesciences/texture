import { TextPropertyEditor } from 'substance'
import { BasePackage, EditorBasePackage } from '../../shared'
import EntityLabelsPackage from './EntityLabelsPackage'
import AddEntityCommand from './AddEntityCommand'
import WorkflowPane from './WorkflowPane'

import TextureContainerEditor from '../../shared/TextureContainerEditor'
import TextNodeComponent from '../editor/TextNodeComponent'

import EntityEditor from './EntityEditor'
import TranslateableEditor from './TranslateableEditor'
import FigureComponent from '../reader/FigureComponent'
import GraphicComponent from './GraphicComponent'
import FnComponent from '../editor/FnComponent'

export default {
  name: 'ArticleMetadata',
  configure (config) {
    config.import(BasePackage)
    config.import(EditorBasePackage)
    // TODO: register MetaDataEditor related UI stuff here
    // Note, that the model package is already loaded by ArticlePackage
    config.import(EntityLabelsPackage)

    config.addComponent('workflow-pane', WorkflowPane, true)

    config.addToolPanel('toolbar', [
      {
        name: 'undo-redo',
        type: 'tool-group',
        showDisabled: true,
        style: 'minimal',
        items: [
          { type: 'command-group', name: 'undo-redo' }
        ]
      },
      {
        name: 'annotations',
        type: 'tool-group',
        showDisabled: true,
        style: 'minimal',
        items: [
          { type: 'command-group', name: 'formatting' }
        ]
      },
      {
        name: 'edit',
        type: 'tool-group',
        showDisabled: true,
        style: 'descriptive',
        items: [
          { type: 'command-group', name: 'add-entity' }
        ]
      },
      {
        name: 'workflows',
        type: 'tool-group',
        showDisabled: true,
        style: 'descriptive',
        items: [
          { type: 'command-group', name: 'workflows' }
        ]
      }
    ])

    config.addLabel('edit', {
      en: 'Edit'
    })
    config.addLabel('workflows', {
      en: 'Workflows'
    })

    config.addCommand('add-author', AddEntityCommand, {
      type: 'author',
      commandGroup: 'add-entity'
    })
    config.addLabel('add-author', {
      en: 'Add Author'
    })

    // Components for editors
    // TODO: we want to move towards a model based implementation
    // using the API instead of the original low-level text property editors
    config.addComponent('text-node', TextNodeComponent)
    config.addComponent('text-property', TextPropertyEditor)
    config.addComponent('container', TextureContainerEditor)

    // Note: in many cases the general EntityEditor implementation is used
    // In some other cases we use custom ones (e.g. figures)
    config.addComponent('entity-editor', EntityEditor)

    config.addComponent('translatable', TranslateableEditor)
    config.addComponent('figure', FigureComponent)

    config.addComponent('graphic', GraphicComponent)

    // TODO: we should use a default component for TextModels
    config.addComponent('caption', TextureContainerEditor)

    // LEGACY:
    config.addComponent('footnote', FnComponent)


    // TODO: we should try to extract these into a package and share with ManuscriptEditor
    config.addAnnotationTool({
      name: 'bold',
      nodeType: 'bold',
      commandGroup: 'formatting',
      icon: 'fa-bold',
      label: 'Strong',
      accelerator: 'CommandOrControl+B'
    })

    config.addAnnotationTool({
      name: 'italic',
      nodeType: 'italic',
      commandGroup: 'formatting',
      icon: 'fa-italic',
      label: 'Emphasize',
      accelerator: 'CommandOrControl+I'
    })

    config.addAnnotationTool({
      name: 'sub',
      nodeType: 'sub',
      commandGroup: 'formatting',
      icon: 'fa-subscript',
      label: 'Subscript'
    })

    config.addAnnotationTool({
      name: 'sup',
      nodeType: 'sup',
      commandGroup: 'formatting',
      icon: 'fa-superscript',
      label: 'Superscript'
    })

    config.addAnnotationTool({
      name: 'monospace',
      nodeType: 'monospace',
      commandGroup: 'formatting',
      icon: 'fa-code',
      label: 'Monospace'
    })
  }
}

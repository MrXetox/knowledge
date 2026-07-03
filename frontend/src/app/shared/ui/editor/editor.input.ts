import { Component, effect, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

import { Toolbar, ToolbarWidget } from '@angular/aria/toolbar';

import { TiptapEditorDirective } from 'ngx-tiptap';
import { Editor, JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import HardBreak from '@tiptap/extension-hard-break';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';

import { lowlight } from '../../../core/utils/lowlight.config';

@Component({
  selector: 'app-editor',
  imports: [
    TiptapEditorDirective,
    Toolbar,
    ToolbarWidget
  ],
  templateUrl: './editor.input.html',
  styleUrl: './editor.input.css',
})
export class EditorInput implements FormValueControl<JSONContent> {
  /**
   * Permet d'établir un binding grâce à la directive [formField] pour modifier la valeur du formulaire parent.
   * @readonly
   */
  readonly value = model<JSONContent>({
    type: 'doc',
    content: [
      {
        type: 'paragraph'
      }
    ]
  });

  /**
   * Permet de savoir si l'input a été touché par l'utilisateur
   * @readonly
   */
  readonly touched = input<boolean>(false);

  /**
   * Permet de vérfier si la valeur de l'input est invalide (true si invalide)
   * @readonly
   */
  readonly invalid = input<boolean>(false);

  /**
   * État de contrôle si le composant a été touché par l'utilisateur
   * @readonly
   */
  readonly touch = output<void>();

  /**
   * Texte décrivant le champ pour l'utilisateur, affiché dans le placeholder de l'éditeur
   * @readonly
   */
  readonly placeholder = input<string>('');

  /**
   * Liste des langages disponible pour le codeblock
   * @private
   */
  protected readonly languages = [
    { value: '', label: 'Auto' },
    { value: 'plaintext', label: 'Texte brut' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'bash', label: 'Bash' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
  ];

  /**
   * Signal indiquant si l'utilisateur se trouve dans un codeblock ou non.
   * @protected
   */
  protected readonly codeblock = signal<boolean>(false);

  /**
   * Signal comportant le langage de programmation du codeblock
   * @protected
   */
  protected readonly codelanguage = signal<string>('');

  /**
   * Éditeur Tiptap avec ses extensions
   * @protected
   */
  protected readonly editor = signal<Editor>(new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      HardBreak.extend({
        addKeyboardShortcuts() {
          const handle = () => {
            if (this.editor.isActive('codeBlock'))
              return this.editor.commands.insertContent('\n');

            return this.editor.commands.setHardBreak()
          }
          return {
            'Enter': () => handle(),
            'Shift-Enter': () => handle()
          }
        }
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          spellcheck: 'false',
          autocorrect: 'off',
          autocapitalize: 'off'
        },
        defaultLanguage: 'plaintext'
      }),
      Placeholder.configure({
        placeholder: this.placeholder(),
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none w-full m-2 text-left outline-none min-h-[80px] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:text-text-ghost [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0'
      }
    },
    onUpdate: ({ editor }) => {
      this.value.set(editor.getJSON());
    },
    onTransaction: ({ editor }) => {
      const status = editor.isActive('codeBlock');
      this.codeblock.set(status);
      this.codelanguage.set(status ? (editor.getAttributes('codeBlock')['language'] ?? '') : '');
    },
    onBlur: () => this.touch.emit()
  }));

  /**
   * Constructeur de la classe, initialise l'effect pour mettre à jour le contenu de l'éditeur lorsque le signal value change
   */
  constructor() {
    effect(() => {
      const initial = this.value();
      const editor = this.editor();

      if (JSON.stringify(initial) !== JSON.stringify(editor.getJSON()))
        editor.commands.setContent(initial);
    });
  }

  /**
   * Détruit l'éditeur Tiptap lorsque le composant est détruit pour libérer les ressources
   */
  ngOnDestroy() {
    this.editor().destroy();
  }

  /**
   * Appelé quand le sélectionneur de langage de code est modifié, met à jour le codeblock avec le nouveau langage
   *
   * @param language le langage de programmation à appliquer au codeblock
   * @protected
   */
  protected onCodeLanguageSet(language: string) {
    this.editor()
      .chain()
      .focus()
      .updateAttributes('codeBlock', { language: language || null })
      .run();
  }
}

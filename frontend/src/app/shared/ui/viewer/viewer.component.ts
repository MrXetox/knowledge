import { Component, effect, input, signal } from '@angular/core';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';

import { NgIcon } from '@ng-icons/core';

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

import { lowlight } from '../../../core/utils/lowlight.config';
import { Linkify } from './linkify.extension';

@Component({
  selector: 'app-viewer',
  imports: [
    TiptapEditorDirective,
    CdkCopyToClipboard,
    NgIcon
  ],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.css',
  host: {
    class: '[&_.ProseMirror]:text-inherit [&_.ProseMirror_*]:text-inherit [&_*]:[text-decoration:inherit]'
  }
})
export class ViewerComponent {
  /**
   * Contenu à afficher dans le composant, peut être du texte brut ou du JSONContent pour Tiptap
   * @readonly
   */
  readonly content = input.required<JSONContent | string>();

  /**
   * Classe CSS à appliquer au conteneur du composant
   * @readonly
   */
  readonly view_class = input<string>('');

  /**
   * Signal indiquant si le contenu a été copié dans le presse-papiers
   * @protected
   */
  protected readonly is_copied = signal<boolean>(false)

  /**
   * Instance de l'éditeur Tiptap configuré pour l'affichage du contenu, non éditable
   * @protected
   */
  protected readonly viewer = signal<Editor>(new Editor({
    editable: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      HardBreak,
      CodeBlockLowlight.configure({
        lowlight
      }),
      Linkify
    ],
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none w-full outline-none`
      }
    }
  }));

  /**
   * Constructeur de la classe, initialise l'effect pour mettre à jour le contenu de l'éditeur lorsque le signal content change
   */
  constructor() {
    effect(() => {
      const content = this.content();
      const viewer = this.viewer();

      viewer.commands.setContent(content);
    });
  }

  /**
   * Détruit l'éditeur Tiptap lorsque le composant est détruit pour libérer les ressources
   */
  ngOnDestroy() {
    this.viewer().destroy();
  }

  /**
   * Affiche un feedback lors de la copie du texte
   *
   * @param success Indique si la copie a réussi
   * @protected
   */
  protected onCopied(success: boolean) {
    // Si la copie a échoué, on ne fait rien
    if (!success) return;
    // On affiche un feedback visuel pendant 2 secondes
    this.is_copied.set(true);
    setTimeout(() => {
      // On réinitialise le feedback visuel après 2 secondes
      this.is_copied.set(false);
    }, 2000)
  }
}

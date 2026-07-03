import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, Transaction, EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

const regex = /(https?:\/\/[^\s]+)/g;

/**
 * Extension Tiptap pour détecter automatiquement les liens dans le texte et les transformer en éléments cliquables.
 * Cette extension utilise une expression régulière pour identifier les URL dans le texte et crée des décorations ProseMirror pour les rendre interactives.
 * Les liens externes sont ouverts dans un nouvel onglet avec les attributs de sécurité appropriés.
 */
export const Linkify = Extension.create({
  name: 'linkify',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('autoLinkViewer'),
        state: {
          init(_, { doc }: { doc: ProseMirrorNode }) {
            return linkify(doc);
          },
          apply(transaction: Transaction, oldState: DecorationSet) {
            if (!transaction.docChanged) return oldState;
            return linkify(transaction.doc);
          },
        },
        props: {
          decorations(state: EditorState) {
            return this.getState(state);
          },
        },
      }),
    ];
  }
});

function linkify(doc: ProseMirrorNode) {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      const text = node.text;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const start = pos + match.index;
        const end = start + match[0].length;

        const attributes: Record<string, string> = {};
        let external = true;

        try {
          const parsed_url = new URL(match[0]);
          if (parsed_url.hostname === window.location.hostname) external = false;
        } catch (e) {}

        if (external) {
          attributes['target'] = '_blank';
          attributes['rel'] = 'noopener noreferrer';
        }

        decorations.push(
          Decoration.inline(start, end, {
            nodeName: 'a',
            href: match[0],
            class: 'text-accent-strong!',
            ...attributes
          })
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

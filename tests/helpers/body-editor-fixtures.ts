export const createEmptyBodyEditorFixture = () => ({
  content: [
    {
      type: 'paragraph',
    },
  ],
  type: 'doc',
});

export const createHeadingBodyEditorFixture = () => ({
  content: [
    {
      attrs: {
        level: 1,
      },
      content: [
        {
          text: 'Capstone Draft',
          type: 'text',
        },
      ],
      type: 'heading',
    },
    {
      content: [
        {
          text: 'Start your introduction here.',
          type: 'text',
        },
      ],
      type: 'paragraph',
    },
  ],
  type: 'doc',
});

export const createBlockquoteBodyEditorFixture = () => ({
  content: [
    {
      content: [
        {
          content: [
            {
              text: 'Quoted evidence',
              type: 'text',
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'blockquote',
    },
  ],
  type: 'doc',
});

export const createUnsupportedFormattingFixture = () => ({
  content: [
    {
      attrs: {
        level: 9,
      },
      content: [
        {
          marks: [
            {
              attrs: {
                color: '#ff00ff',
              },
              type: 'textStyle',
            },
            {
              type: 'bold',
            },
          ],
          text: 'Imported heading',
          type: 'text',
        },
      ],
      type: 'heading',
    },
    {
      content: [
        {
          content: [
            {
              content: [
                {
                  text: 'Bullet that should flatten',
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'listItem',
        },
      ],
      type: 'bulletList',
    },
  ],
  type: 'doc',
});

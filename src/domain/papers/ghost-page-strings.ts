import type { Language } from '@domain/shared/contracts';

export interface GhostPageStrings {
  abstract: string;
  abstractPlaceholder: string;
  authorName: string;
  authorNote: string;
  authorNotePlaceholder: string;
  bodyDraft: string;
  bodyPlaceholder: string;
  courseName: string;
  dueDate: string;
  institution: string;
  professorName: string;
  references: string;
  referencesEmptyState: string;
  runningHead: string;
  runningHeadPrefix: string;
  studentName: string;
  titlePage: string;
}

const strings: Record<Language, GhostPageStrings> = {
  en: {
    abstract: 'Abstract',
    abstractPlaceholder:
      'Summarize the paper in one concise paragraph once the abstract workflow lands.',
    authorName: 'Author Name',
    authorNote: 'Author note',
    authorNotePlaceholder: 'Add department or acknowledgment details',
    bodyDraft: 'Body Draft',
    bodyPlaceholder: 'Start your introduction here.',
    courseName: 'Course Name',
    dueDate: 'Due date',
    institution: 'Institution',
    professorName: 'Professor name',
    references: 'References',
    referencesEmptyState:
      'No references yet. Add references in the inspector to build this page automatically.',
    runningHead: 'Short title',
    runningHeadPrefix: 'Running head:',
    studentName: 'Student Name',
    titlePage: 'Title Page',
  },
  es: {
    abstract: 'Resumen',
    abstractPlaceholder:
      'Resume el trabajo en un párrafo conciso cuando el flujo de resumen esté disponible.',
    authorName: 'Nombre del Autor',
    authorNote: 'Nota del autor',
    authorNotePlaceholder: 'Agrega detalles del departamento o agradecimientos',
    bodyDraft: 'Borrador del Cuerpo',
    bodyPlaceholder: 'Comienza tu introducción aquí.',
    courseName: 'Nombre del Curso',
    dueDate: 'Fecha de entrega',
    institution: 'Institución',
    professorName: 'Nombre del profesor',
    references: 'Referencias',
    referencesEmptyState:
      'Aún no hay referencias. Agrega referencias en el inspector para construir esta página automáticamente.',
    runningHead: 'Título corto',
    runningHeadPrefix: 'Encabezado:',
    studentName: 'Nombre del Estudiante',
    titlePage: 'Página de Título',
  },
};

export const getGhostPageStrings = (language: Language): GhostPageStrings =>
  strings[language];

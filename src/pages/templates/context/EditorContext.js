import React, { createContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePageFilters } from 'src/hooks';
import useEditorAnnotations from '../hooks/useEditorAnnotations';
import useEditorContent from '../hooks/useEditorContent';
import useEditorNavigation from '../hooks/useEditorNavigation';
import useEditorPreview from '../hooks/useEditorPreview';
import useEditorTabs from '../hooks/useEditorTabs';
import useEditorTestData from '../hooks/useEditorTestData';

const EditorContext = createContext();

const chainHooks = (...hooks) => hooks.reduce((acc, hook) => ({ ...acc, ...hook(acc) }), {});

const initFilters = {
  subaccount: {},
};

export const EditorContextProvider = ({
  children,
  value: { getDraft, getPublished, listDomains, listSubaccounts, ...value },
}) => {
  const { id, version } = useParams();
  const { filters } = usePageFilters(initFilters);
  const pageValue = chainHooks(
    () => value,
    useEditorContent,
    useEditorNavigation,
    useEditorTestData,
    useEditorPreview, // must follow `useEditorContent` and `useEditorTestData`
    useEditorAnnotations, // must follow `useEditorContent` and `useEditorTestData`
    useEditorTabs,
  );

  useEffect(() => {
    getDraft(id, filters.subaccount);
    listDomains();
    listSubaccounts();

    if (version === 'published') {
      getPublished(id, filters.subaccount);
    }
  }, [listSubaccounts, listDomains, getDraft, getPublished, id, version, filters.subaccount]);

  return <EditorContext.Provider value={pageValue}>{children}</EditorContext.Provider>;
};

export default EditorContext;

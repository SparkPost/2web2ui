import { useEffect, useState } from 'react';

// the store for in progress content changes
const useEditorContent = ({ draft = {}, published = {}, isPublishedMode }) => {
  const [state, setState] = useState({});
  const [hasSaved, setHasSaved] = useState(true);

  const setContent = nextState => {
    if (isPublishedMode) {
      return; // do not allow updating published content
    }

    // Hide the saved indicator if content has changed
    if (state !== nextState) {
      setHasSaved(false);
    }

    setState({ ...state, ...nextState }); // merge-in
  };

  // hydrate when loaded
  useEffect(() => {
    const activeContent = isPublishedMode ? published.content : draft.content;

    if (activeContent) {
      setState(activeContent);
    }

    if (isPublishedMode) {
      setHasSaved(true);
    }
  }, [draft.content, published.content, isPublishedMode]);

  return {
    content: state,
    setContent,
    setHasSaved,
    hasSaved,
  };
};

export default useEditorContent;

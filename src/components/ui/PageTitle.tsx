
import { useEffect } from 'react';
import { APP_NAME }  from '../../utils/constants';

interface PageTitleProps {
  title: string;
}

const PageTitle = ({ title }: PageTitleProps) => {
  useEffect(() => {
    document.title = `${title} — ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);

  return null;  // renders nothing — only sets document title
};

export default PageTitle;
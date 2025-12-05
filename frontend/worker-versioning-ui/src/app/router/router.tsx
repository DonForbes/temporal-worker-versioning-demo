import { createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import HomePage from '../../features/home/HomePage';
import UnpinnedTestResults from '../../features/home/UnpinnedTestResults';
import PinnedWorkflowManagement from '../../features/home/PinnedWorkflowManagement';
import UnpinnedWorkflowManagement from '../../features/home/UnpinnedWorkflowManagement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'activities', element: <div>Activities</div> },
      { path: 'createActivity', element: <div>Create Activity</div> },
      { path: 'results/:workflowPrefix', element: <UnpinnedTestResults /> },
      { path: 'pinned', element: <PinnedWorkflowManagement /> },
      { path: 'unpinned', element: <UnpinnedWorkflowManagement /> }
    ]
  }
]);

export default router;



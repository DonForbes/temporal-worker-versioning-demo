import { createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import HomePage from '../../features/home/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'activities', element: <div>Activities</div> },
      { path: 'createActivity', element: <div>Create Activity</div> }
    ]
  }
]);

export default router;


